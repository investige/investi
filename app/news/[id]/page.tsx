import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "../../lib/supabase/server";
import PostView from "./PostView";

async function getPost(id: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, title, body, category, thumbnail_url, author_id, created_at")
    .eq("id", id)
    .maybeSingle();
  return post;
}

const SITE_URL = "https://investi.ge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return {};

  const shareTitle = `წაიკითხე სტატია: "${post.title}"`;
  const description = post.body.slice(0, 160);
  const url = `${SITE_URL}/news/${post.id}`;

  return {
    title: post.title,
    description,
    openGraph: {
      title: shareTitle,
      description,
      url,
      type: "article",
      images: post.thumbnail_url ? [{ url: post.thumbnail_url }] : undefined,
    },
    twitter: {
      card: post.thumbnail_url ? "summary_large_image" : "summary",
      title: shareTitle,
      description,
      images: post.thumbnail_url ? [post.thumbnail_url] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: isAdmin }, { data: countsRaw }, { data: myVote }] =
    await Promise.all([
      user ? supabase.rpc("is_admin") : Promise.resolve({ data: false }),
      supabase.rpc("get_post_vote_counts", { post_ids: [id] }),
      user
        ? supabase
            .from("post_votes")
            .select("post_id")
            .eq("post_id", id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const counts = (countsRaw || []) as { post_id: string; votes: number }[];
  const voteCount = counts[0]?.votes ?? 0;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <PostView
        post={post}
        canManage={!!isAdmin || post.author_id === user?.id}
        voteCount={voteCount}
        voted={!!myVote}
        loggedIn={!!user}
      />
    </main>
  );
}
