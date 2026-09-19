"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ka">
      <body className="min-h-screen bg-[#2d1b4e] text-white flex items-center justify-center">
        <main className="max-w-xl mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-bold mb-4">დაფიქსირდა შეცდომა</h2>
          <p className="text-purple-200 mb-6">
            საიტი დროებით ვერ იტვირთა. სცადეთ თავიდან.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-lg bg-white text-[#2d1b4e] px-4 py-2"
          >
            თავიდან ცდა
          </button>
        </main>
      </body>
    </html>
  );
}
