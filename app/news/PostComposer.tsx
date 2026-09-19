"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { CATEGORIES, type Category, type PostBlock } from "./types";
import PostBlockEditor from "./PostBlockEditor";

export default function PostComposer({
  heading,
  onPublished,
}: {
  heading: string;
  onPublished: () => void;
}) {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<PostBlock[]>([{ type: "text", text: "" }]);
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!ignore) setUserId(data.user?.id ?? null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function publish() {
    const body = blocks
      .filter((block): block is { type: "text"; text: string } => block.type === "text")
      .map((block) => block.text.trim())
      .filter(Boolean)
      .join("\n\n");

    if (!title.trim() || !body) {
      setMessage("სათაური და ტექსტი უნდა");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setSaving(false);
      return;
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const path = `${data.user.id}/${Date.now()}-${thumbnailFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("post-thumbnails")
        .upload(path, thumbnailFile);

      if (uploadError) {
        setSaving(false);
        setMessage(uploadError.message);
        return;
      }

      thumbnailUrl = supabase.storage
        .from("post-thumbnails")
        .getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      title: title.trim(),
      body,
      content_blocks: blocks,
      category,
      thumbnail_url: thumbnailUrl,
      author_id: data.user.id,
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setBlocks([{ type: "text", text: "" }]);
    setThumbnailFile(null);
    setMessage("გამოქვეყნდა");
    onPublished();
  }

  return (
    <div className="mb-12 rounded-xl border border-purple-800/70 p-5">
      <h2 className="text-xl font-bold mb-4">{heading}</h2>

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

      <label className="block mb-3 text-sm text-purple-200">
        Thumbnail ფოტო (არასავალდებულო) — ეს ჩანს ბარათზე, კითხვამდე
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          className="block mt-1 text-purple-200"
        />
      </label>

      <p className="mb-2 text-sm text-purple-200">
        სტატიის ტექსტი — შეგიძლია ტექსტსა და ფოტოებს შორის მონაცვლეობა
      </p>
      <PostBlockEditor blocks={blocks} onChange={setBlocks} authorId={userId} />

      <button
        type="button"
        onClick={publish}
        disabled={saving}
        className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2 disabled:opacity-50"
      >
        გამოქვეყნება
      </button>
      {message && <p className="mt-3 text-purple-200">{message}</p>}
    </div>
  );
}
