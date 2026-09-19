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
  created_at: string;
};
