"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

const PENDING_PASSWORD_KEY = "investi-pending-password";

export default function ChangePasswordForm({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function requestChange() {
    if (password.length < 6) {
      setMessage("პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს");
      return;
    }
    if (password !== confirm) {
      setMessage("პაროლები არ ემთხვევა");
      return;
    }

    setSending(true);
    setMessage("");

    try {
      localStorage.setItem(PENDING_PASSWORD_KEY, password);
    } catch {
      // localStorage unavailable — the confirm page will just ask them to
      // retype it, same as the plain forgot-password flow.
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword("");
    setConfirm("");
    setSent(true);
  }

  if (sent) {
    return (
      <section className="rounded-xl border border-purple-800/70 p-5">
        <h2 className="text-xl font-bold mb-2">პაროლის შეცვლა</h2>
        <p className="text-purple-200">
          პაროლი <strong>ჯერ არ შეცვლილა</strong>. შეამოწმე მეილი (
          {email}) და ბმულზე დაჭერით დაადასტურე ცვლილება.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-purple-800/70 p-5">
      <h2 className="text-xl font-bold mb-4">პაროლის შეცვლა</h2>
      <input
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
        placeholder="ახალი პაროლი"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
        placeholder="გაიმეორე ახალი პაროლი"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <button
        type="button"
        onClick={requestChange}
        disabled={sending}
        className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2 disabled:opacity-50"
      >
        პაროლის შეცვლა
      </button>
      <p className="mt-3 text-xs text-purple-400">
        დასადასტურებლად საჭირო იქნება მეილზე მოსული ბმულის დაჭერა.
      </p>
      {message && <p className="mt-3 text-purple-200">{message}</p>}
    </section>
  );
}
