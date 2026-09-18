"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  async function signIn() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) setMessage(error.message);
    else window.location.href = "/";
  }

  async function signUp() {
    if (password !== confirm) {
      setMessage("პაროლები არ ემთხვევა");
      return;
    }
    if (password.length < 6) {
      setMessage("პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setMessage(error ? error.message : "შეამოწმე მეილი დასადასტურებლად");
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage("");
          }}
          className={mode === "login" ? "font-bold" : "text-purple-300"}
        >
          შესვლა
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setMessage("");
          }}
          className={mode === "register" ? "font-bold" : "text-purple-300"}
        >
          რეგისტრაცია
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">
        {mode === "login" ? "შესვლა" : "რეგისტრაცია"}
      </h1>

      <input
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
        placeholder="მეილი"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
        placeholder="პაროლი"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {mode === "register" && (
        <input
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
          placeholder="პაროლი ხელახლა"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      )}

      <button
        type="button"
        onClick={mode === "login" ? signIn : signUp}
        className="mt-2 rounded-lg bg-white text-[#2d1b4e] px-4 py-2"
      >
        {mode === "login" ? "შესვლა" : "რეგისტრაცია"}
      </button>

      {message && <p className="mt-4 text-purple-200">{message}</p>}
    </main>
  );
}