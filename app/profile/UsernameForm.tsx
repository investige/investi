"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function UsernameForm({
  userId,
  initialUsername,
}: {
  userId: string;
  initialUsername: string;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [saved, setSaved] = useState(initialUsername);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = username.trim();
    if (!trimmed) {
      setMessage("სახელი არ შეიძლება ცარიელი იყოს");
      return;
    }
    if (trimmed.length > 30) {
      setMessage("სახელი მაქსიმუმ 30 სიმბოლო შეიძლება იყოს");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ username: trimmed })
      .eq("user_id", userId);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setSaved(trimmed);
    setUsername(trimmed);
    setMessage("შენახულია");
  }

  return (
    <section className="mb-10 rounded-xl border border-purple-800/70 p-5">
      <h2 className="text-xl font-bold mb-2">მეტსახელი</h2>
      <p className="text-sm text-purple-300 mb-4">
        ეს სახელი გამოჩნდება საიტზე შენს პოსტებთან და კომენტარებთან,
        ნაცვლად შენი მეილისა.
      </p>
      <input
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        type="button"
        onClick={save}
        disabled={saving || username.trim() === saved}
        className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2 disabled:opacity-50"
      >
        შენახვა
      </button>
      {message && <p className="mt-3 text-purple-200">{message}</p>}
    </section>
  );
}
