"use client";

import { useRouter } from "next/navigation";
import PostCard from "../PostCard";
import type { Post } from "../types";

export default function PostView({
  post,
  canManage,
  voteCount,
  voted,
  loggedIn,
}: {
  post: Post;
  canManage: boolean;
  voteCount: number;
  voted: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();

  return (
    <PostCard
      post={post}
      canManage={canManage}
      onChanged={() => router.refresh()}
      voteCount={voteCount}
      voted={voted}
      loggedIn={loggedIn}
      shareUrl={`/news/${post.id}`}
    />
  );
}
