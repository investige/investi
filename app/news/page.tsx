"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { CATEGORIES, type Category, type Post } from "./types";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<Category | "ყველა">("ყველა");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  async function loadPosts(activeFilter: Category | "ყველა") {
    const supabase = createClient();
    let query = supabase
      .from("posts")
      .select("id, title, body, category, thumbnail_url, author_id, created_at")
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
      setUsernames({});
      return;
    }

    const authorIds = Array.from(new Set(list.map((post) => post.author_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", authorIds);
    setUsernames(
      Object.fromEntries(
        (profiles || []).map((p: { user_id: string; username: string }) => [
          p.user_id,
          p.username,
        ])
      )
    );

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
    supabase.auth.getUser().then(async ({ data }) => {
      setLoggedIn(!!data.user);
      setUserId(data.user?.id ?? null);
      if (data.user) {
        const { data: adminCheck } = await supabase.rpc("is_admin");
        setIsAdmin(!!adminCheck);
      }
    });
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

      {loggedIn ? (
        <PostComposer heading="დაწერე პოსტი" onPublished={() => loadPosts(filter)} />
      ) : (
        <p className="mb-12 text-purple-200">
          <a href="/login" className="underline hover:text-white">
            შედი ანგარიშში
          </a>{" "}
          საკუთარი პოსტის დასაწერად.
        </p>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canManage={isAdmin || post.author_id === userId}
            onChanged={() => loadPosts(filter)}
            voteCount={counts[post.id] ?? 0}
            voted={voted.has(post.id)}
            loggedIn={loggedIn}
            shareUrl={`/news/${post.id}`}
            authorUsername={usernames[post.author_id]}
          />
        ))}
        {posts.length === 0 && (
          <p className="text-purple-300">პოსტები ჯერ არ არის.</p>
        )}
      </div>
    </main>
  );
}
