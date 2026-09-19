"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import type { PostBlock } from "./types";

export default function PostBlockEditor({
  blocks,
  onChange,
  authorId,
}: {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
  authorId: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function updateText(index: number, text: string) {
    const next = [...blocks];
    next[index] = { type: "text", text };
    onChange(next);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function addText() {
    onChange([...blocks, { type: "text", text: "" }]);
  }

  async function addImage(file: File) {
    if (!authorId) return;
    setUploading(true);
    setMessage("");

    const supabase = createClient();
    const path = `${authorId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("post-thumbnails")
      .upload(path, file);

    setUploading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const url = supabase.storage.from("post-thumbnails").getPublicUrl(path)
      .data.publicUrl;
    onChange([...blocks, { type: "image", url }]);
  }

  return (
    <div className="mb-3">
      {blocks.map((block, index) =>
        block.type === "text" ? (
          <div key={index} className="mb-3">
            <textarea
              className="w-full rounded-lg px-3 py-2 bg-purple-900 text-purple-100 border border-purple-700 min-h-32"
              placeholder="ტექსტი"
              value={block.text}
              onChange={(e) => updateText(index, e.target.value)}
            />
            {blocks.length > 1 && (
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="mt-1 text-xs text-purple-300 hover:text-white"
              >
                ამ ტექსტის წაშლა
              </button>
            )}
          </div>
        ) : (
          <div key={index} className="mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.url}
              alt=""
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeBlock(index)}
              className="mt-1 text-xs text-purple-300 hover:text-white block"
            >
              ფოტოს წაშლა
            </button>
          </div>
        )
      )}

      <div className="flex gap-4 items-center">
        <button
          type="button"
          onClick={addText}
          className="text-sm text-purple-200 hover:text-white underline"
        >
          + ტექსტის დამატება
        </button>
        <label className="text-sm text-purple-200 hover:text-white underline cursor-pointer">
          {uploading ? "იტვირთება..." : "+ ფოტოს დამატება"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading || !authorId}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) addImage(file);
            }}
          />
        </label>
      </div>
      {message && <p className="mt-2 text-purple-200 text-sm">{message}</p>}
    </div>
  );
}
