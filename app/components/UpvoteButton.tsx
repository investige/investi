"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

type Kind = "post" | "quiz" | "comment";

const CONFIG: Record<Kind, { table: string; column: string }> = {
  post: { table: "post_votes", column: "post_id" },
  quiz: { table: "quiz_votes", column: "quiz_id" },
  comment: { table: "comment_votes", column: "comment_id" },
};

export default function UpvoteButton({
  kind,
  targetId,
  initialCount,
  initialVoted,
  loggedIn,
}: {
  kind: Kind;
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!loggedIn) {
      router.push("/login");
      return;
    }
    if (pending) return;

    setPending(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setPending(false);
      router.push("/login");
      return;
    }

    const { table, column } = CONFIG[kind];

    if (voted) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(column, targetId)
        .eq("user_id", data.user.id);
      if (!error) {
        setVoted(false);
        setCount((c) => c - 1);
      }
    } else {
      const { error } = await supabase
        .from(table)
        .insert({ [column]: targetId, user_id: data.user.id });
      if (!error) {
        setVoted(true);
        setCount((c) => c + 1);
      }
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      title={loggedIn ? "Up" : "შედი ანგარიშში Up-ის მისაცემად"}
      className={
        "flex flex-col items-center justify-center rounded-lg border px-3 py-2 leading-none transition-colors " +
        (voted
          ? "border-white bg-white text-[#2d1b4e]"
          : "border-purple-700 text-purple-200 hover:text-white hover:border-purple-400")
      }
    >
      <span className="text-lg">▲</span>
      <span className="text-xs mt-1">{count}</span>
    </button>
  );
}
