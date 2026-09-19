-- Let any registered user write posts (not just admin), while keeping
-- admin able to manage everyone's posts. Also adds a thumbnail image,
-- same pattern as quiz-thumbnails storage.

alter table public.posts
  add column if not exists thumbnail_url text;

-- Anyone signed in can publish, as long as they set themselves as author.
drop policy if exists "only admin can insert posts" on public.posts;
drop policy if exists "users can insert own posts" on public.posts;
create policy "users can insert own posts"
  on public.posts
  for insert
  to authenticated
  with check (auth.uid() = author_id);

-- Keep admin's blanket manage-everything policies, add matching
-- "manage your own" policies for regular users. Multiple permissive RLS
-- policies for the same command are OR'd together.
drop policy if exists "users can update own posts" on public.posts;
create policy "users can update own posts"
  on public.posts
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "users can delete own posts" on public.posts;
create policy "users can delete own posts"
  on public.posts
  for delete
  to authenticated
  using (auth.uid() = author_id);

-- Storage bucket for post thumbnails, mirroring quiz-thumbnails: public
-- read, any signed-in user may upload/delete since any of them can now
-- author a post (table grants on storage.objects already exist by
-- default in every Supabase project).
insert into storage.buckets (id, name, public)
values ('post-thumbnails', 'post-thumbnails', true)
on conflict (id) do nothing;

drop policy if exists "public read post thumbnails" on storage.objects;
create policy "public read post thumbnails"
  on storage.objects
  for select
  to public
  using (bucket_id = 'post-thumbnails');

drop policy if exists "authenticated upload post thumbnails" on storage.objects;
create policy "authenticated upload post thumbnails"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'post-thumbnails');
