"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import SocialLoginButtons from "../components/SocialLoginButtons";
import {
  getRemainingLockSeconds,
  recordFailedAttempt,
  recordSuccess,
} from "./lockout";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [lockedSeconds, setLockedSeconds] = useState(() =>
    getRemainingLockSeconds()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLockedSeconds(getRemainingLockSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function signIn() {
    const remaining = getRemainingLockSeconds();
    if (remaining > 0) {
      setLockedSeconds(remaining);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const lockedFor = recordFailedAttempt();
      if (lockedFor > 0) {
        setLockedSeconds(lockedFor);
        setMessage("ბევრი წარუმატებელი ცდა — სცადე მოგვიანებით");
      } else {
        setMessage(error.message);
      }
      return;
    }

    recordSuccess();
    window.location.href = "/";
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

  async function sendResetEmail() {
    if (!email.trim()) {
      setMessage("შეიყვანე მეილი");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    );

    setMessage(
      error
        ? error.message
        : "თუ ეს მეილი დარეგისტრირებულია, გამოგზავნილია ბმული პაროლის აღსადგენად"
    );
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
        {mode === "login" && "შესვლა"}
        {mode === "register" && "რეგისტრაცია"}
        {mode === "forgot" && "პაროლის აღდგენა"}
      </h1>

      {mode !== "forgot" && <SocialLoginButtons />}

      <input
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
        placeholder="მეილი"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {mode !== "forgot" && (
        <input
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
          placeholder="პაროლი"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {mode === "register" && (
        <input
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
          placeholder="პაროლი ხელახლა"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      )}

      {mode === "login" && (
        <button
          type="button"
          onClick={() => {
            setMode("forgot");
            setMessage("");
          }}
          className="mb-3 block text-sm text-purple-300 hover:text-white"
        >
          დაგავიწყდა პაროლი?
        </button>
      )}

      {mode === "forgot" ? (
        <button
          type="button"
          onClick={sendResetEmail}
          className="mt-2 rounded-lg bg-white text-[#2d1b4e] px-4 py-2"
        >
          ბმულის გამოგზავნა
        </button>
      ) : (
        <button
          type="button"
          onClick={mode === "login" ? signIn : signUp}
          disabled={mode === "login" && lockedSeconds > 0}
          className="mt-2 rounded-lg bg-white text-[#2d1b4e] px-4 py-2 disabled:opacity-50"
        >
          {mode === "login" ? "შესვლა" : "რეგისტრაცია"}
        </button>
      )}

      {mode === "login" && lockedSeconds > 0 && (
        <p className="mt-4 text-purple-200">
          ბევრი წარუმატებელი ცდა — სცადე {lockedSeconds} წამში
        </p>
      )}
      {message && <p className="mt-4 text-purple-200">{message}</p>}
    </main>
  );
}
