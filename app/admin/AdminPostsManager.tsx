"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { type Post } from "../news/types";
import PostCard from "../news/PostCard";
import PostComposer from "../news/PostComposer";

async function fetchUsernames(
  authorIds: string[]
): Promise<Record<string, string>> {
  if (authorIds.length === 0) return {};
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("user_id, username")
    .in("user_id", Array.from(new Set(authorIds)));
  return Object.fromEntries(
    (data || []).map((p: { user_id: string; username: string }) => [
      p.user_id,
      p.username,
    ])
  );
}

export default function AdminPostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});

  async function loadPosts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("posts")
      .select(
        "id, title, body, category, thumbnail_url, content_blocks, author_id, created_at"
      )
      .order("created_at", { ascending: false });
    const list = data || [];
    setPosts(list);
    setUsernames(await fetchUsernames(list.map((p) => p.author_id)));
  }

  useEffect(() => {
    let ignore = false;
    createClient()
      .from("posts")
      .select(
        "id, title, body, category, thumbnail_url, content_blocks, author_id, created_at"
      )
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (ignore) return;
        const list = data || [];
        setPosts(list);
        setUsernames(await fetchUsernames(list.map((p) => p.author_id)));
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
          <PostCard
            key={post.id}
            post={post}
            canManage
            onChanged={loadPosts}
            authorUsername={usernames[post.author_id]}
          />
        ))}
        {posts.length === 0 && (
          <p className="text-purple-300">პოსტები ჯერ არ არის.</p>
        )}
      </div>
    </>
  );
}
