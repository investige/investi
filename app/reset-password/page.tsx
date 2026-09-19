"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function save() {
    if (password.length < 6) {
      setMessage("პაროლი მინიმუმ 6 სიმბოლო უნდა იყოს");
      return;
    }
    if (password !== confirm) {
      setMessage("პაროლები არ ემთხვევა");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">პაროლი შეიცვალა</h1>
        <a href="/login" className="underline hover:text-white">
          შედი ახალი პაროლით
        </a>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-purple-200">
          ეს ბმული აღარ არის მოქმედი. სთხოვე ახალი{" "}
          <a href="/login" className="underline hover:text-white">
            შესვლის გვერდზე
          </a>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">ახალი პაროლი</h1>
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
        onClick={save}
        className="mt-2 rounded-lg bg-white text-[#2d1b4e] px-4 py-2"
      >
        შენახვა
      </button>
      {message && <p className="mt-4 text-purple-200">{message}</p>}
    </main>
  );
}
