"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

const CATEGORIES = [
  "ზოგადი",
  "ბაზრის სიახლეები",
  "განათლება",
  "ანალიზი",
] as const;

type Category = (typeof CATEGORIES)[number];

type Post = {
  id: string;
  title: string;
  body: string;
  category: Category;
  created_at: string;
};

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<Category | "ყველა">("ყველა");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");

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
    setPosts(data || []);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      setLoggedIn(!!data.user);
      if (data.user) {
        const { data: adminCheck } = await supabase.rpc("is_admin");
        setIsAdmin(!!adminCheck);
      }
    });
  }, []);

  useEffect(() => {
    loadPosts(filter);
  }, [filter]);

  async function publish() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setMessage("პოსტს მხოლოდ ადმინი წერს");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setMessage("სათაური და ტექსტი უნდა");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      title: title.trim(),
      body: body.trim(),
      category,
      author_id: data.user.id,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setBody("");
    setMessage("გამოქვეყნდა");
    loadPosts(filter);
  }

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

      {loggedIn && isAdmin ? (
        <div className="mb-12">
          <select
            className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
            placeholder="სათაური"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black min-h-32"
            placeholder="ტექსტი"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="button"
            onClick={publish}
            className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2"
          >
            გამოქვეყნება
          </button>
          {message && <p className="mt-3 text-purple-200">{message}</p>}
        </div>
      ) : (
        <p className="mb-12 text-purple-200">სტატიებს აქვეყნებს ინვესტორი.</p>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-xl border border-purple-800/70 p-5"
          >
            <span className="inline-block mb-2 rounded-full bg-purple-950/60 px-3 py-1 text-xs text-purple-200">
              {post.category}
            </span>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="whitespace-pre-wrap text-purple-100">{post.body}</p>
            <p className="mt-3 text-sm text-purple-300">ინვესტორი</p>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="text-purple-300">პოსტები ჯერ არ არის.</p>
        )}
      </div>
    </main>
  );
}
