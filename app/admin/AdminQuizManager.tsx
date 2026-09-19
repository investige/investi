"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type QuizListItem = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  quiz_questions: { count: number }[];
};

type DraftQuestion = {
  question: string;
  options: [string, string, string];
  correctIndex: number;
};

export default function AdminQuizManager() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [title, setTitle] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [qText, setQText] = useState("");
  const [qOptions, setQOptions] = useState<[string, string, string]>([
    "",
    "",
    "",
  ]);
  const [qCorrect, setQCorrect] = useState(0);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadQuizzes() {
    const supabase = createClient();
    const { data } = await supabase
      .from("quizzes")
      .select("id, title, thumbnail_url, quiz_questions(count)")
      .order("created_at", { ascending: false })
      .returns<QuizListItem[]>();
    setQuizzes(data || []);
  }

  useEffect(() => {
    let ignore = false;
    createClient()
      .from("quizzes")
      .select("id, title, thumbnail_url, quiz_questions(count)")
      .order("created_at", { ascending: false })
      .returns<QuizListItem[]>()
      .then(({ data }) => {
        if (!ignore) setQuizzes(data || []);
      });
    return () => {
      ignore = true;
    };
  }, []);

  function addQuestion() {
    if (!qText.trim() || qOptions.some((option) => !option.trim())) {
      setMessage("კითხვა და სამივე ვარიანტი შეავსე");
      return;
    }

    setQuestions([
      ...questions,
      { question: qText.trim(), options: qOptions, correctIndex: qCorrect },
    ]);
    setQText("");
    setQOptions(["", "", ""]);
    setQCorrect(0);
    setMessage("");
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  async function createQuiz() {
    if (!title.trim()) {
      setMessage("ქვიზს სათაური სჭირდება");
      return;
    }
    if (questions.length === 0) {
      setMessage("დაამატე მინიმუმ ერთი კითხვა");
      return;
    }

    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      const path = `${Date.now()}-${thumbnailFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("quiz-thumbnails")
        .upload(path, thumbnailFile);

      if (uploadError) {
        setSaving(false);
        setMessage(uploadError.message);
        return;
      }

      thumbnailUrl = supabase.storage
        .from("quiz-thumbnails")
        .getPublicUrl(path).data.publicUrl;
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({
        title: title.trim(),
        thumbnail_url: thumbnailUrl,
        author_id: userData.user.id,
      })
      .select("id")
      .single();

    if (quizError || !quiz) {
      setSaving(false);
      setMessage(quizError?.message || "ქვიზის შექმნა ვერ მოხერხდა");
      return;
    }

    const { error: questionsError } = await supabase
      .from("quiz_questions")
      .insert(
        questions.map((q, index) => ({
          quiz_id: quiz.id,
          question: q.question,
          options: q.options,
          correct_index: q.correctIndex,
          position: index,
        }))
      );

    setSaving(false);

    if (questionsError) {
      setMessage(questionsError.message);
      return;
    }

    setTitle("");
    setThumbnailFile(null);
    setQuestions([]);
    setMessage("ქვიზი შეიქმნა");
    loadQuizzes();
  }

  async function deleteQuiz(id: string) {
    if (!window.confirm("წავშალო ეს ქვიზი ყველა კითხვასთან ერთად?")) return;
    const supabase = createClient();
    await supabase.from("quizzes").delete().eq("id", id);
    loadQuizzes();
  }

  return (
    <>
      <div className="mb-12 rounded-xl border border-purple-800/70 p-5">
        <h2 className="text-xl font-bold mb-4">ახალი ქვიზი</h2>

        <input
          className="w-full mb-3 rounded-lg px-3 py-2 bg-white text-black"
          placeholder="ქვიზის სათაური"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block mb-4 text-sm text-purple-200">
          Thumbnail ფოტო (არასავალდებულო)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="block mt-1 text-purple-200"
          />
        </label>

        {questions.length > 0 && (
          <div className="mb-4 space-y-2">
            {questions.map((q, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-purple-950/50 px-3 py-2 text-sm"
              >
                <span>{q.question}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="text-purple-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-purple-800/50 p-3 mb-4">
          <p className="text-sm text-purple-300 mb-2">კითხვის დამატება</p>
          <input
            className="w-full mb-2 rounded-lg px-3 py-2 bg-white text-black"
            placeholder="კითხვა"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
          {qOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="correct"
                checked={qCorrect === index}
                onChange={() => setQCorrect(index)}
              />
              <input
                className="flex-1 rounded-lg px-3 py-2 bg-white text-black"
                placeholder={`ვარიანტი ${index + 1}`}
                value={option}
                onChange={(e) => {
                  const next = [...qOptions] as [string, string, string];
                  next[index] = e.target.value;
                  setQOptions(next);
                }}
              />
            </div>
          ))}
          <p className="text-xs text-purple-400 mb-2">
            მონიშნე რადიო ღილაკით სწორი პასუხი
          </p>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border border-purple-700 px-3 py-1.5 text-sm text-purple-200 hover:text-white"
          >
            + კითხვის დამატება სიაში
          </button>
        </div>

        <button
          type="button"
          onClick={createQuiz}
          disabled={saving}
          className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2 disabled:opacity-50"
        >
          ქვიზის შექმნა
        </button>
        {message && <p className="mt-3 text-purple-200">{message}</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">ყველა ქვიზი</h2>
      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="flex items-center justify-between rounded-xl border border-purple-800/70 p-4"
          >
            <div>
              <p className="font-bold">{quiz.title}</p>
              <p className="text-sm text-purple-300">
                {quiz.quiz_questions?.[0]?.count ?? 0} კითხვა
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteQuiz(quiz.id)}
              className="text-sm text-purple-300 hover:text-white"
            >
              წაშლა
            </button>
          </div>
        ))}
        {quizzes.length === 0 && (
          <p className="text-purple-300">ქვიზები ჯერ არ არის.</p>
        )}
      </div>
    </>
  );
}
