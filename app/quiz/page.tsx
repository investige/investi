import { createClient } from "../lib/supabase/server";

type QuizRow = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  quiz_questions: { count: number }[];
};

export default async function QuizListPage() {
  const supabase = await createClient();
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, title, thumbnail_url, quiz_questions(count)")
    .order("created_at", { ascending: false })
    .returns<QuizRow[]>();

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">ქვიზები</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {(quizzes || []).map((quiz) => {
          const count = quiz.quiz_questions?.[0]?.count ?? 0;
          return (
            <a
              key={quiz.id}
              href={`/quiz/${quiz.id}`}
              className="block overflow-hidden rounded-xl border border-purple-800/70 bg-purple-950/40 hover:bg-purple-900/50 transition-colors"
            >
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
              <div className="p-4">
                <p className="font-bold">{quiz.title}</p>
                <p className="text-[0.8em] text-purple-300 mt-1">
                  {count} კითხვა
                </p>
              </div>
            </a>
          );
        })}

        {(!quizzes || quizzes.length === 0) && (
          <p className="text-purple-300">ჯერ ქვიზი არ დამატებულა.</p>
        )}
      </div>
    </main>
  );
}
