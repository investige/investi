"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "შეამოწმე მეილი დასადასტურებლად");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
        if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">შესვლა</h1>
      <input
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
        placeholder="მეილი"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full mb-4 rounded-lg px-3 py-2 bg-white text-black"
        placeholder="პაროლი"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-3">
        <button
          onClick={signIn}
          className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2"
        >
          შესვლა
        </button>
        <button
          onClick={signUp}
          className="rounded-lg border border-purple-400 px-4 py-2"
        >
          რეგისტრაცია
        </button>
      </div>
      {message && <p className="mt-4 text-purple-200">{message}</p>}
    </main>
  );
}