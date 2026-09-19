import { notFound } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import QuizRunner from "./QuizRunner";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();

  if (!quiz) {
    notFound();
  }

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("id, question, options, correct_index")
    .eq("quiz_id", id)
    .order("position", { ascending: true });

  return (
    <QuizRunner
      quizId={quiz.id}
      title={quiz.title}
      questions={questions || []}
    />
  );
}
