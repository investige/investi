import Link from "next/link";
import type { Post } from "../news/types";
import UpvoteButton from "./UpvoteButton";

export default function HomeFeedCard({
  post,
  voteCount,
  voted,
  loggedIn,
  authorUsername,
}: {
  post: Post;
  voteCount: number;
  voted: boolean;
  loggedIn: boolean;
  authorUsername?: string;
}) {
  const excerpt =
    post.body.length > 140 ? post.body.slice(0, 140).trim() + "…" : post.body;

  return (
    <article className="group relative rounded-xl border border-purple-800 bg-purple-900 overflow-hidden flex flex-col transition-colors hover:border-accent">
      <Link href={`/news/${post.id}`} className="flex flex-col flex-1">
        {post.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail_url}
            alt=""
            className="w-full h-36 object-cover"
          />
        ) : (
          <div className="w-full h-36 bg-purple-950" />
        )}
        <div className="p-4 flex flex-col flex-1">
          <span className="inline-block w-fit rounded-full bg-accent/15 px-3 py-1 text-xs text-accent mb-2">
            {post.category}
          </span>
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:underline">
            {post.title}
          </h3>
          <p className="text-sm text-purple-200 line-clamp-3 flex-1">
            {excerpt}
          </p>
          {authorUsername && (
            <p className="mt-3 text-xs text-purple-400">
              დაწერა: {authorUsername}
            </p>
          )}
        </div>
      </Link>
      <div className="absolute top-3 right-3">
        <UpvoteButton
          kind="post"
          targetId={post.id}
          initialCount={voteCount}
          initialVoted={voted}
          loggedIn={loggedIn}
        />
      </div>
    </article>
  );
}
