"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { CATEGORIES, type Category, type Post } from "./types";
import UpvoteButton from "../components/UpvoteButton";

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<Category | "ყველა">("ყველა");
  const [loggedIn, setLoggedIn] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Set<string>>(new Set());

  async function loadPosts(activeFilter: Category | "ყველა") {
    const supabase = createClient();
    let query = supabase
      .from("posts")
      .select("id, title, body, category, created_at")
      .order("created_at", { ascending: false });

    if (activeFilter !== "ყველა") {
      query = query.eq("category", activeFilter);
    }

    const { data } = await query;
    const list = data || [];
    setPosts(list);

    const ids = list.map((post) => post.id);
    if (ids.length === 0) {
      setCounts({});
      setVoted(new Set());
      return;
    }

    const { data: countRows } = await supabase.rpc("get_post_vote_counts", {
      post_ids: ids,
    });
    setCounts(
      Object.fromEntries(
        (countRows || []).map((c: { post_id: string; votes: number }) => [
          c.post_id,
          c.votes,
        ])
      )
    );

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: myVotes } = await supabase
        .from("post_votes")
        .select("post_id")
        .in("post_id", ids);
      setVoted(
        new Set((myVotes || []).map((v: { post_id: string }) => v.post_id))
      );
    } else {
      setVoted(new Set());
    }
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  useEffect(() => {
    loadPosts(filter);
  }, [filter]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">სიახლეები</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {(["ყველა", ...CATEGORIES] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={
              "rounded-full px-3 py-1 text-sm " +
              (filter === option
                ? "bg-white text-[#2d1b4e]"
                : "bg-purple-950/60 text-purple-200 hover:bg-purple-900/60")
            }
          >
            {option}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="relative rounded-xl border border-purple-800/70 p-5 pr-20"
          >
            <span className="inline-block mb-2 rounded-full bg-purple-950/60 px-3 py-1 text-xs text-purple-200">
              {post.category}
            </span>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="whitespace-pre-wrap text-purple-100">{post.body}</p>
            <p className="mt-3 text-sm text-purple-300">ინვესტორი</p>
            <div className="absolute top-5 right-5">
              <UpvoteButton
                kind="post"
                targetId={post.id}
                initialCount={counts[post.id] ?? 0}
                initialVoted={voted.has(post.id)}
                loggedIn={loggedIn}
              />
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="text-purple-300">პოსტები ჯერ არ არის.</p>
        )}
      </div>
    </main>
  );
}
