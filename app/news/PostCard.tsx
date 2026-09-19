"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { CATEGORIES, type Category, type Post } from "./types";
import UpvoteButton from "../components/UpvoteButton";
import ShareButtons from "../components/ShareButtons";

export default function PostCard({
  post,
  canManage,
  onChanged,
  voteCount,
  voted,
  loggedIn,
  shareUrl,
  authorUsername,
}: {
  post: Post;
  canManage: boolean;
  onChanged: () => void;
  voteCount?: number;
  voted?: boolean;
  loggedIn?: boolean;
  shareUrl?: string;
  authorUsername?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [category, setCategory] = useState<Category>(post.category);
  const [message, setMessage] = useState("");

  async function save() {
    if (!title.trim() || !body.trim()) {
      setMessage("სათაური და ტექსტი უნდა");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({ title: title.trim(), body: body.trim(), category })
      .eq("id", post.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setEditing(false);
    onChanged();
  }

  async function remove() {
    if (!window.confirm("წავშალო ეს პოსტი?")) return;

    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", post.id);
    onChanged();
  }

  if (editing) {
    return (
      <article className="rounded-xl border border-purple-800/70 p-5">
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black min-h-32"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2"
          >
            შენახვა
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-purple-700 px-4 py-2 text-purple-200"
          >
            გაუქმება
          </button>
        </div>
        {message && <p className="mt-3 text-purple-200">{message}</p>}
      </article>
    );
  }

  return (
    <article
      className={
        "relative rounded-xl border border-purple-800/70 p-5" +
        (voteCount !== undefined ? " pr-20" : "")
      }
    >
      {post.thumbnail_url &&
        (shareUrl ? (
          <Link href={shareUrl}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail_url}
              alt=""
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
          </Link>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail_url}
            alt=""
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
        ))}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="inline-block rounded-full bg-purple-950/60 px-3 py-1 text-xs text-purple-200">
          {post.category}
        </span>
        {canManage && (
          <div className="flex gap-3 text-sm text-purple-300">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="hover:text-white"
            >
              რედაქტირება
            </button>
            <button
              type="button"
              onClick={remove}
              className="hover:text-white"
            >
              წაშლა
            </button>
          </div>
        )}
      </div>
      {shareUrl ? (
        <Link href={shareUrl} className="block">
          <h2 className="text-xl font-bold mb-2 hover:underline">
            {post.title}
          </h2>
          <p className="whitespace-pre-wrap text-purple-100">{post.body}</p>
        </Link>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          <p className="whitespace-pre-wrap text-purple-100">{post.body}</p>
        </>
      )}

      {authorUsername && (
        <p className="mt-3 text-sm text-purple-300">
          დაწერა: {authorUsername}
        </p>
      )}

      {shareUrl && (
        <div className="mt-4">
          <ShareButtons path={shareUrl} title={post.title} />
        </div>
      )}

      {voteCount !== undefined && (
        <div className="absolute top-5 right-5">
          <UpvoteButton
            kind="post"
            targetId={post.id}
            initialCount={voteCount}
            initialVoted={!!voted}
            loggedIn={!!loggedIn}
          />
        </div>
      )}
    </article>
  );
}
