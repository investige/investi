"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b border-purple-800/60">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-bold text-lg tracking-wide">
          ინვესტორი
        </a>
        <nav className="flex gap-6 text-sm text-purple-200 items-center">
          <a href="/" className="hover:text-white">
            მთავარი
          </a>
          <a href="/stocks" className="hover:text-white">
            სტოკები
          </a>
          <a href="/news" className="hover:text-white">
            სიახლეები
          </a>
          <a href="/quiz" className="hover:text-white">
            იცი
          </a>
          {email ? (
            <button onClick={signOut} className="hover:text-white">
              გასვლა
            </button>
          ) : (
            <a href="/login" className="hover:text-white">
              შესვლა
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}