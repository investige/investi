"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkAdmin(hasUser: boolean) {
      if (!hasUser) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.rpc("is_admin");
      setIsAdmin(!!data);
    }

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      checkAdmin(!!data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      checkAdmin(!!session?.user);
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
          <Link href="/quiz" className="hover:text-white">
            იცი
          </Link>
          {isAdmin && (
            <a href="/admin" className="hover:text-white">
              ადმინი
            </a>
          )}
          {email ? (
            <>
              <a href="/profile" className="hover:text-white">
                პროფილი
              </a>
              <button onClick={signOut} className="hover:text-white">
                გასვლა
              </button>
            </>
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