"use client";

import { useState } from "react";
import AdminPostsManager from "./AdminPostsManager";
import AdminQuizManager from "./AdminQuizManager";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"posts" | "quizzes">("posts");

  return (
    <>
      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => setTab("posts")}
          className={tab === "posts" ? "font-bold" : "text-purple-300"}
        >
          პოსტები
        </button>
        <button
          type="button"
          onClick={() => setTab("quizzes")}
          className={tab === "quizzes" ? "font-bold" : "text-purple-300"}
        >
          ქვიზები
        </button>
      </div>

      {tab === "posts" ? <AdminPostsManager /> : <AdminQuizManager />}
    </>
  );
}
