import Link from "next/link";
import { createClient } from "./lib/supabase/server";
import HomeFeedCard from "./components/HomeFeedCard";
import type { Post } from "./news/types";

const FEED_LIMIT = 9;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postsData } = await supabase
    .from("posts")
    .select("id, title, body, category, thumbnail_url, author_id, created_at")
    .order("created_at", { ascending: false })
    .limit(FEED_LIMIT);

  const posts = (postsData || []) as Post[];
  const ids = posts.map((post) => post.id);
  const authorIds = Array.from(new Set(posts.map((post) => post.author_id)));

  const [{ data: countsRaw }, { data: myVotes }, { data: profiles }] =
    await Promise.all([
      ids.length > 0
        ? supabase.rpc("get_post_vote_counts", { post_ids: ids })
        : Promise.resolve({ data: [] as { post_id: string; votes: number }[] }),
      user && ids.length > 0
        ? supabase.from("post_votes").select("post_id").in("post_id", ids)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
      authorIds.length > 0
        ? supabase
            .from("profiles")
            .select("user_id, username")
            .in("user_id", authorIds)
        : Promise.resolve({ data: [] as { user_id: string; username: string }[] }),
    ]);

  const counts = Object.fromEntries(
    (countsRaw || []).map((c: { post_id: string; votes: number }) => [
      c.post_id,
      c.votes,
    ])
  );
  const voted = new Set((myVotes || []).map((v) => v.post_id));
  const usernames = Object.fromEntries(
    (profiles || []).map((p) => [p.user_id, p.username])
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <p className="text-sm tracking-[0.25em] uppercase text-purple-200 mb-4">
          investi.ge
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-6">ინვესტორი</h1>
        <p className="text-lg text-purple-100 leading-relaxed">
          ქართული საიტი ინვესტიციებზე
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">ბოლო სტატიები</h2>
        <Link href="/news" className="text-purple-200 hover:text-white underline">
          ყველას ნახვა
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-purple-300">ჯერ სტატია არ არის დამატებული.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <HomeFeedCard
              key={post.id}
              post={post}
              voteCount={counts[post.id] ?? 0}
              voted={voted.has(post.id)}
              loggedIn={!!user}
              authorUsername={usernames[post.author_id]}
            />
          ))}
        </div>
      )}
    </main>
  );
}
