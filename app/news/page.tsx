"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase";

type Post = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

const ADMIN_EMAIL = "shavladzegiorgi@gmail.com";

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  const isAdmin = email === ADMIN_EMAIL;

  async function loadPosts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, created_at")
      .order("created_at", { ascending: false });
    setPosts(data || []);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
      setLoggedIn(!!data.user);
    });
    loadPosts();
  }, []);

  async function publish() {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user || data.user.email !== ADMIN_EMAIL) {
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
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">სიახლეები</h1>

      {loggedIn && isAdmin ? (
        <div className="mb-12">
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