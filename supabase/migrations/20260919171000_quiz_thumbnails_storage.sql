-- Public storage bucket for quiz thumbnail images. Table-level grants on
-- storage.objects already exist by default in every Supabase project
-- (unlike our own public tables) — only RLS policies are needed here.

insert into storage.buckets (id, name, public)
values ('quiz-thumbnails', 'quiz-thumbnails', true)
on conflict (id) do nothing;

drop policy if exists "public read quiz thumbnails" on storage.objects;
create policy "public read quiz thumbnails"
  on storage.objects
  for select
  to public
  using (bucket_id = 'quiz-thumbnails');

drop policy if exists "admin upload quiz thumbnails" on storage.objects;
create policy "admin upload quiz thumbnails"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'quiz-thumbnails' and public.is_admin());

drop policy if exists "admin delete quiz thumbnails" on storage.objects;
create policy "admin delete quiz thumbnails"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'quiz-thumbnails' and public.is_admin());
