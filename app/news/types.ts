export const CATEGORIES = [
  "ზოგადი",
  "ბაზრის სიახლეები",
  "განათლება",
  "ანალიზი",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type PostBlock =
  | { type: "text"; text: string }
  | { type: "image"; url: string };

export type Post = {
  id: string;
  title: string;
  body: string;
  category: Category;
  thumbnail_url: string | null;
  content_blocks: PostBlock[] | null;
  author_id: string;
  created_at: string;
};
