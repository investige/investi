import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://investi.ge";

function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getPublicClient();

  const [{ data: posts }, { data: quizzes }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("quizzes")
      .select("id, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const postEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/news/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const quizEntries: MetadataRoute.Sitemap = (quizzes || []).map((quiz) => ({
    url: `${SITE_URL}/quiz/${quiz.id}`,
    lastModified: new Date(quiz.created_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postEntries,
    ...quizEntries,
  ];
}
