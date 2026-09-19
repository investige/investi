export const CATEGORIES = [
  "ზოგადი",
  "ბაზრის სიახლეები",
  "განათლება",
  "ანალიზი",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Post = {
  id: string;
  title: string;
  body: string;
  category: Category;
  thumbnail_url: string | null;
  author_id: string;
  created_at: string;
};
