"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { CATEGORIES, type Category, type Post } from "../news/types";
import PostCard from "../news/PostCard";

export default function AdminPostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [message, setMessage] = useState("");

  async function loadPosts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, category, created_at")
      .order("created_at", { ascending: false });
    setPosts(data || []);
  }

  useEffect(() => {
    let ignore = false;
    createClient()
      .from("posts")
      .select("id, title, body, category, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!ignore) setPosts(data || []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function publish() {
    if (!title.trim() || !body.trim()) {
      setMessage("სათაური და ტექსტი უნდა");
      return;
    }

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

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
    loadPosts();
  }

  return (
    <>
      <div className="mb-12 rounded-xl border border-purple-800/70 p-5">
        <h2 className="text-xl font-bold mb-4">ახალი პოსტი</h2>
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

      <h2 className="text-xl font-bold mb-4">ყველა პოსტი</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} isAdmin onChanged={loadPosts} />
        ))}
        {posts.length === 0 && (
          <p className="text-purple-300">პოსტები ჯერ არ არის.</p>
        )}
      </div>
    </>
  );
}
