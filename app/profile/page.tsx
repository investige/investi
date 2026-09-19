import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ password_changed?: string }>;
}) {
  const { password_changed } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: watchlist },
    { data: attempts },
    { count: postVotes },
    { count: quizVotes },
  ] = await Promise.all([
    supabase
      .from("watchlist")
      .select("symbol")
      .order("created_at", { ascending: true }),
    supabase
      .from("quiz_attempts")
      .select("score, total, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("post_votes").select("*", { count: "exact", head: true }),
    supabase.from("quiz_votes").select("*", { count: "exact", head: true }),
  ]);

  const totalUpvotes = (postVotes ?? 0) + (quizVotes ?? 0);

  const bestAttempt = (attempts || []).reduce<
    { score: number; total: number } | null
  >((best, attempt) => {
    if (!best || attempt.score / attempt.total > best.score / best.total) {
      return attempt;
    }
    return best;
  }, null);

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">პროფილი</h1>
      <p className="text-purple-200 mb-1">{user.email}</p>
      <p className="text-purple-300 text-sm mb-8">
        მიცემული Up: {totalUpvotes}
      </p>

      <section className="mb-10 rounded-xl border border-purple-800/70 p-5">
        <h2 className="text-xl font-bold mb-4">საყურებელი სია</h2>
        {watchlist && watchlist.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {watchlist.map((row) => (
              <span
                key={row.symbol}
                className="rounded-full bg-purple-950/60 px-3 py-1 text-sm"
              >
                {row.symbol}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-purple-300">
            ჯერ არაფერი დაგიმატებია.{" "}
            <a href="/stocks" className="underline hover:text-white">
              დაამატე ტიკერები
            </a>
          </p>
        )}
      </section>

      <section className="rounded-xl border border-purple-800/70 p-5">
        <h2 className="text-xl font-bold mb-4">ქვიზის შედეგები</h2>
        {attempts && attempts.length > 0 ? (
          <>
            {bestAttempt && (
              <p className="mb-4 text-purple-200">
                საუკეთესო შედეგი: {bestAttempt.score} / {bestAttempt.total}
              </p>
            )}
            <ul className="space-y-2 text-sm">
              {attempts.map((attempt, index) => (
                <li
                  key={index}
                  className="flex justify-between border-t border-purple-800/50 pt-2 first:border-0 first:pt-0"
                >
                  <span className="text-purple-300">
                    {new Date(attempt.created_at).toLocaleDateString("ka-GE")}
                  </span>
                  <span>
                    {attempt.score} / {attempt.total}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-purple-300">
            ჯერ არ გისცდია.{" "}
            <Link href="/quiz" className="underline hover:text-white">
              გაიარე ქვიზი
            </Link>
          </p>
        )}
      </section>

      {user.email && (
        <div className="mt-10">
          <ChangePasswordForm
            email={user.email}
            justChanged={password_changed === "1"}
          />
        </div>
      )}
    </main>
  );
}
