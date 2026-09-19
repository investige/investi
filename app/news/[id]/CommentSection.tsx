"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import UpvoteButton from "../../components/UpvoteButton";

type Comment = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
};

async function fetchCommentsData(postId: string, userId?: string) {
  const supabase = createClient();

  const { data } = await supabase
    .from("comments")
    .select("id, user_id, body, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const list = data || [];
  const commentIds = list.map((c) => c.id);
  const authorIds = Array.from(new Set(list.map((c) => c.user_id)));

  const [{ data: profiles }, { data: countRows }, { data: myVotes }] =
    await Promise.all([
      authorIds.length > 0
        ? supabase
            .from("profiles")
            .select("user_id, username")
            .in("user_id", authorIds)
        : Promise.resolve({
            data: [] as { user_id: string; username: string }[],
          }),
      commentIds.length > 0
        ? supabase.rpc("get_comment_vote_counts", { comment_ids: commentIds })
        : Promise.resolve({
            data: [] as { comment_id: string; votes: number }[],
          }),
      userId && commentIds.length > 0
        ? supabase
            .from("comment_votes")
            .select("comment_id")
            .in("comment_id", commentIds)
        : Promise.resolve({ data: [] as { comment_id: string }[] }),
    ]);

  return {
    comments: list,
    usernames: Object.fromEntries(
      (profiles || []).map((p: { user_id: string; username: string }) => [
        p.user_id,
        p.username,
      ])
    ) as Record<string, string>,
    counts: Object.fromEntries(
      (countRows || []).map((c: { comment_id: string; votes: number }) => [
        c.comment_id,
        c.votes,
      ])
    ) as Record<string, number>,
    voted: new Set(
      (myVotes || []).map((v: { comment_id: string }) => v.comment_id)
    ),
  };
}

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
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  async function refresh() {
    const result = await fetchCommentsData(postId, currentUserId);
    setComments(result.comments);
    setUsernames(result.usernames);
    setCounts(result.counts);
    setVoted(result.voted);
  }

  useEffect(() => {
    let ignore = false;
    fetchCommentsData(postId, currentUserId).then((result) => {
      if (ignore) return;
      setComments(result.comments);
      setUsernames(result.usernames);
      setCounts(result.counts);
      setVoted(result.voted);
    });
    return () => {
      ignore = true;
    };
  }, [postId, currentUserId]);

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
    refresh();
  }

  async function removeComment(id: string) {
    if (!window.confirm("წავშალო ეს კომენტარი?")) return;
    const supabase = createClient();
    await supabase.from("comments").delete().eq("id", id);
    refresh();
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">
        კომენტარები ({comments.length})
      </h2>

      {loggedIn ? (
        <div className="mb-6">
          <textarea
            className="w-full mb-2 rounded-lg px-3 py-2 bg-purple-900 text-purple-100 border border-purple-700 min-h-24"
            placeholder="დაწერე კომენტარი..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="button"
            onClick={postComment}
            disabled={posting}
            className="rounded-lg bg-accent text-bg px-4 py-2 disabled:opacity-50"
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
            className="flex items-start justify-between gap-3 rounded-lg border border-purple-800/60 p-4"
          >
            <div className="min-w-0 flex-1">
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
            <UpvoteButton
              kind="comment"
              targetId={comment.id}
              initialCount={counts[comment.id] ?? 0}
              initialVoted={voted.has(comment.id)}
              loggedIn={loggedIn}
            />
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-purple-300">ჯერ კომენტარი არ არის.</p>
        )}
      </div>
    </section>
  );
}
