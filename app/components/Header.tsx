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
    <header className="sticky top-0 z-10 border-b border-purple-800 bg-purple-950/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-semibold text-lg tracking-wide"
        >
          ინვესტორი
        </Link>
        <nav className="flex gap-6 text-sm text-purple-200 items-center">
          <Link href="/" className="hover:text-white">
            მთავარი
          </Link>
          <Link href="/stocks" className="hover:text-white">
            სტოკები
          </Link>
          <Link href="/news" className="hover:text-white">
            სიახლეები
          </Link>
          <Link href="/quiz" className="hover:text-white">
            იცი
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-white">
              ადმინი
            </Link>
          )}
          {email ? (
            <>
              <Link href="/profile" className="hover:text-white">
                პროფილი
              </Link>
              <button onClick={signOut} className="hover:text-white">
                გასვლა
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-accent text-bg px-4 py-1.5 font-medium hover:opacity-90"
            >
              შესვლა
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}