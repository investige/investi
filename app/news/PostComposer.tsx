"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import { CATEGORIES, type Category } from "./types";

export default function PostComposer({
  heading,
  onPublished,
}: {
  heading: string;
  onPublished: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function publish() {
    if (!title.trim() || !body.trim()) {
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
      body: body.trim(),
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
    setBody("");
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
        Thumbnail ფოტო (არასავალდებულო)
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          className="block mt-1 text-purple-200"
        />
      </label>

      <textarea
        className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black min-h-32"
        placeholder="ტექსტი"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

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
