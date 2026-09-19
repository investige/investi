import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import UpvoteButton from "../components/UpvoteButton";

type QuizRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  quiz_questions: { count: number }[];
};

export default async function QuizListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, thumbnail_url, quiz_questions(count)")
    .order("created_at", { ascending: false })
    .returns<QuizRow[]>();

  const ids = (quizzes || []).map((q) => q.id);

  type VoteCount = { quiz_id: string; votes: number };
  type MyVote = { quiz_id: string };

  const [countsResult, myVotesResult] = await Promise.all([
    ids.length > 0
      ? supabase.rpc("get_quiz_vote_counts", { quiz_ids: ids })
      : Promise.resolve({ data: [] as VoteCount[] }),
    user && ids.length > 0
      ? supabase.from("quiz_votes").select("quiz_id").in("quiz_id", ids)
      : Promise.resolve({ data: [] as MyVote[] }),
  ]);

  const counts = (countsResult.data || []) as VoteCount[];
  const myVotes = (myVotesResult.data || []) as MyVote[];

  const countMap = new Map<string, number>(
    counts.map((c) => [c.quiz_id, c.votes])
  );
  const votedSet = new Set(myVotes.map((v) => v.quiz_id));

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">ქვიზები</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {(quizzes || []).map((quiz) => {
          const count = quiz.quiz_questions?.[0]?.count ?? 0;
          return (
            <div
              key={quiz.id}
              className="relative overflow-hidden rounded-xl border border-purple-800/70 bg-purple-950/40 hover:bg-purple-900/50 transition-colors"
            >
              <Link href={`/quiz/${quiz.id}`} className="block">
                <div className="aspect-video bg-purple-900/60">
                  {quiz.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={quiz.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400 text-3xl">
                      ?
                    </div>
                  )}
                </div>
                <div className="p-4 pr-16">
                  <p className="font-bold">{quiz.title}</p>
                  <p className="text-[0.8em] text-purple-300 mt-1">
                    {count} კითხვა
                  </p>
                </div>
              </Link>
              <div className="absolute bottom-3 right-3">
                <UpvoteButton
                  kind="quiz"
                  targetId={quiz.id}
                  initialCount={countMap.get(quiz.id) ?? 0}
                  initialVoted={votedSet.has(quiz.id)}
                  loggedIn={!!user}
                />
              </div>
            </div>
          );
        })}

        {(!quizzes || quizzes.length === 0) && (
          <p className="text-purple-300">ჯერ ქვიზი არ დამატებულა.</p>
        )}
      </div>
    </main>
  );
}
