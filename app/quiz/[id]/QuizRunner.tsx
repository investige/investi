"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
};

export default function QuizRunner({
  quizId,
  title,
  questions,
}: {
  quizId: string;
  title: string;
  questions: Question[];
}) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function choose(index: number) {
    const finalScore =
      index === questions[step].correct_index ? score + 1 : score;

    if (index === questions[step].correct_index) {
      setScore(finalScore);
    }

    if (step + 1 === questions.length) {
      setDone(true);
      saveAttempt(finalScore);
    } else {
      setStep(step + 1);
    }
  }

  async function saveAttempt(finalScore: number) {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    await supabase.from("quiz_attempts").insert({
      user_id: data.user.id,
      quiz_id: quizId,
      score: finalScore,
      total: questions.length,
    });
  }

  if (questions.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="text-purple-300">ამ ქვიზს ჯერ კითხვები არ აქვს.</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">შედეგი</h1>
        <p className="text-xl text-purple-100">
          {score} / {questions.length}
        </p>
        <button
          className="mt-8 rounded-lg bg-white text-[#2d1b4e] px-5 py-2 font-medium"
          onClick={() => {
            setStep(0);
            setScore(0);
            setDone(false);
          }}
        >
          თავიდან
        </button>
        <Link
          href="/quiz"
          className="mt-4 block text-purple-300 hover:text-white underline"
        >
          სხვა ქვიზები
        </Link>
      </main>
    );
  }

  const current = questions[step];

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <p className="text-sm text-purple-400 mb-1">{title}</p>
      <p className="text-sm text-purple-300 mb-2">
        კითხვა {step + 1} / {questions.length}
      </p>
      <h1 className="text-2xl font-bold mb-8">{current.question}</h1>
      <div className="space-y-3">
        {current.options.map((option, index) => (
          <button
            key={option}
            onClick={() => choose(index)}
            className="w-full text-left rounded-xl border border-purple-800/70 bg-purple-950/40 px-4 py-3 hover:bg-purple-900/60"
          >
            {option}
          </button>
        ))}
      </div>
    </main>
  );
}
