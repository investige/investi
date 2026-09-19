-- Lets a post's body be a sequence of text/image blocks (write some text,
-- add a photo, write more text, add another photo...) instead of one plain
-- text field. `body` stays as-is: it's now the concatenation of the text
-- blocks, kept for excerpts, share text, and OG description, and as the
-- fallback render for posts written before this migration (content_blocks
-- is null for those, so the UI falls back to plain body text).

alter table public.posts
  add column if not exists content_blocks jsonb;
