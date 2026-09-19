"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

const SYMBOL_PATTERN = /^[A-Z0-9.]{1,10}$/;

export default function WatchlistEditor({ symbols }: { symbols: string[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function addSymbol() {
    const symbol = value.trim().toUpperCase();
    if (!SYMBOL_PATTERN.test(symbol)) {
      setMessage("ტიკერი: მხოლოდ ლათინური ასოები/ციფრები, მაქს. 10 სიმბოლო");
      return;
    }

    setPending(true);
    setMessage("");

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setPending(false);
      return;
    }

    const { error } = await supabase
      .from("watchlist")
      .insert({ user_id: data.user.id, symbol });

    setPending(false);

    if (error) {
      setMessage(
        error.code === "23505" ? "ეს ტიკერი უკვე დამატებულია" : error.message
      );
      return;
    }

    setValue("");
    router.refresh();
  }

  async function removeSymbol(symbol: string) {
    const supabase = createClient();
    await supabase.from("watchlist").delete().eq("symbol", symbol);
    router.refresh();
  }

  return (
    <div className="mb-8 rounded-xl border border-purple-800/70 p-4">
      {symbols.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {symbols.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => removeSymbol(symbol)}
              className="rounded-full bg-purple-950/60 px-3 py-1 text-sm hover:bg-purple-900/80"
              title="წაშლა"
            >
              {symbol} ✕
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg px-3 py-2 bg-purple-900 text-purple-100 border border-purple-700"
          placeholder="ტიკერი, მაგ. TSLA"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          onClick={addSymbol}
          disabled={pending}
          className="rounded-lg bg-accent text-bg px-4 py-2 disabled:opacity-50"
        >
          დამატება
        </button>
      </div>

      {message && <p className="mt-2 text-sm text-purple-200">{message}</p>}
    </div>
  );
}
