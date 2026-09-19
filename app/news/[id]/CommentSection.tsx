"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type Comment = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export default function CommentSection({
  postId,
  loggedIn,
  currentUserId,
  isAdmin,
}: {
  postId: string;
  loggedIn: boolean;
  currentUserId?: string;
  isAdmin: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function loadComments() {
    const supabase = createClient();
    const { data } = await supabase
      .from("comments")
      .select("id, user_id, body, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    const list = data || [];
    setComments(list);

    const userIds = Array.from(new Set(list.map((c) => c.user_id)));
    if (userIds.length === 0) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username")
      .in("user_id", userIds);
    setUsernames(
      Object.fromEntries(
        (profiles || []).map((p: { user_id: string; username: string }) => [
          p.user_id,
          p.username,
        ])
      )
    );
  }

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    supabase
      .from("comments")
      .select("id, user_id, body, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(async ({ data }) => {
        if (ignore) return;
        const list = data || [];
        setComments(list);

        const userIds = Array.from(new Set(list.map((c) => c.user_id)));
        if (userIds.length === 0) return;

        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", userIds);
        if (ignore) return;
        setUsernames(
          Object.fromEntries(
            (profiles || []).map(
              (p: { user_id: string; username: string }) => [
                p.user_id,
                p.username,
              ]
            )
          )
        );
      });

    return () => {
      ignore = true;
    };
  }, [postId]);

  async function postComment() {
    if (!body.trim()) {
      setMessage("კომენტარი არ შეიძლება ცარიელი იყოს");
      return;
    }

    setPosting(true);
    setMessage("");

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setPosting(false);
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: data.user.id,
      body: body.trim(),
    });

    setPosting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setBody("");
    loadComments();
  }

  async function removeComment(id: string) {
    if (!window.confirm("წავშალო ეს კომენტარი?")) return;
    const supabase = createClient();
    await supabase.from("comments").delete().eq("id", id);
    loadComments();
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">
        კომენტარები ({comments.length})
      </h2>

      {loggedIn ? (
        <div className="mb-6">
          <textarea
            className="w-full mb-2 rounded-lg px-3 py-2 bg-white text-black min-h-24"
            placeholder="დაწერე კომენტარი..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="button"
            onClick={postComment}
            disabled={posting}
            className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2 disabled:opacity-50"
          >
            კომენტარის დატოვება
          </button>
          {message && <p className="mt-2 text-purple-200">{message}</p>}
        </div>
      ) : (
        <p className="mb-6 text-purple-200">
          <a href="/login" className="underline hover:text-white">
            შედი ანგარიშში
          </a>{" "}
          კომენტარის დასატოვებლად.
        </p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-lg border border-purple-800/60 p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-purple-200">
                {usernames[comment.user_id] || "..."}
              </span>
              {(isAdmin || comment.user_id === currentUserId) && (
                <button
                  type="button"
                  onClick={() => removeComment(comment.id)}
                  className="text-xs text-purple-400 hover:text-white"
                >
                  წაშლა
                </button>
              )}
            </div>
            <p className="whitespace-pre-wrap text-purple-100">
              {comment.body}
            </p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-purple-300">ჯერ კომენტარი არ არის.</p>
        )}
      </div>
    </section>
  );
}
