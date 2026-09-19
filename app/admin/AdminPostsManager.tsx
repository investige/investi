"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { type Post } from "../news/types";
import PostCard from "../news/PostCard";
import PostComposer from "../news/PostComposer";

export default function AdminPostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);

  async function loadPosts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select("id, title, body, category, thumbnail_url, author_id, created_at")
      .order("created_at", { ascending: false });
    setPosts(data || []);
  }

  useEffect(() => {
    let ignore = false;
    createClient()
      .from("posts")
      .select("id, title, body, category, thumbnail_url, author_id, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!ignore) setPosts(data || []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      <PostComposer heading="ახალი პოსტი" onPublished={loadPosts} />

      <h2 className="text-xl font-bold mb-4">ყველა პოსტი</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} canManage onChanged={loadPosts} />
        ))}
        {posts.length === 0 && (
          <p className="text-purple-300">პოსტები ჯერ არ არის.</p>
        )}
      </div>
    </>
  );
}
