import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "../../lib/supabase/server";
import PostView from "./PostView";
import CommentSection from "./CommentSection";
import HomeFeedCard from "../../components/HomeFeedCard";
import type { Post } from "../types";

async function getPost(id: string) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, title, body, category, thumbnail_url, content_blocks, author_id, created_at"
    )
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

  const [{ data: isAdmin }, { data: countsRaw }, { data: myVote }, { data: authorProfile }] =
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
      supabase
        .from("profiles")
        .select("username")
        .eq("user_id", post.author_id)
        .maybeSingle(),
    ]);

  const counts = (countsRaw || []) as { post_id: string; votes: number }[];
  const voteCount = counts[0]?.votes ?? 0;

  if (user) {
    await supabase
      .from("post_views")
      .upsert(
        { post_id: post.id, user_id: user.id },
        { onConflict: "post_id,user_id", ignoreDuplicates: true }
      );
  }

  let recommendedQuery = supabase
    .from("posts")
    .select(
      "id, title, body, category, thumbnail_url, content_blocks, author_id, created_at"
    )
    .neq("id", post.id)
    .order("created_at", { ascending: false })
    .limit(3);

  if (user) {
    const { data: viewed } = await supabase
      .from("post_views")
      .select("post_id")
      .eq("user_id", user.id);
    const viewedIds = (viewed || []).map((v) => v.post_id);
    if (viewedIds.length > 0) {
      recommendedQuery = recommendedQuery.not(
        "id",
        "in",
        `(${viewedIds.join(",")})`
      );
    }
  }

  const { data: recommendedRaw } = await recommendedQuery;
  const recommended = (recommendedRaw || []) as Post[];
  const recommendedIds = recommended.map((p) => p.id);
  const recommendedAuthorIds = Array.from(
    new Set(recommended.map((p) => p.author_id))
  );

  const [
    { data: recCountsRaw },
    { data: recMyVotes },
    { data: recProfiles },
  ] = await Promise.all([
    recommendedIds.length > 0
      ? supabase.rpc("get_post_vote_counts", { post_ids: recommendedIds })
      : Promise.resolve({ data: [] as { post_id: string; votes: number }[] }),
    user && recommendedIds.length > 0
      ? supabase.from("post_votes").select("post_id").in("post_id", recommendedIds)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
    recommendedAuthorIds.length > 0
      ? supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", recommendedAuthorIds)
      : Promise.resolve({ data: [] as { user_id: string; username: string }[] }),
  ]);

  const recCounts = Object.fromEntries(
    (recCountsRaw || []).map((c: { post_id: string; votes: number }) => [
      c.post_id,
      c.votes,
    ])
  );
  const recVoted = new Set((recMyVotes || []).map((v) => v.post_id));
  const recUsernames = Object.fromEntries(
    (recProfiles || []).map((p) => [p.user_id, p.username])
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <PostView
        post={post}
        canManage={!!isAdmin || post.author_id === user?.id}
        voteCount={voteCount}
        voted={!!myVote}
        loggedIn={!!user}
        authorUsername={authorProfile?.username}
      />
      <CommentSection
        postId={post.id}
        loggedIn={!!user}
        currentUserId={user?.id}
        isAdmin={!!isAdmin}
      />

      {recommended.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">შენთვის რეკომენდებული</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommended.map((p) => (
              <HomeFeedCard
                key={p.id}
                post={p}
                voteCount={recCounts[p.id] ?? 0}
                voted={recVoted.has(p.id)}
                loggedIn={!!user}
                authorUsername={recUsernames[p.author_id]}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
