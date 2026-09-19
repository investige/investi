-- Baseline: bring the existing `posts` table and its RLS policies under version
-- control (they previously only existed in the Supabase dashboard/SQL editor).
-- Also adds UPDATE/DELETE admin policies, which were missing.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  author_id uuid references auth.users(id)
);

alter table public.posts enable row level security;

drop policy if exists "anyone can read posts" on public.posts;
create policy "anyone can read posts"
  on public.posts
  for select
  to anon, authenticated
  using (true);

drop policy if exists "only admin can insert posts" on public.posts;
create policy "only admin can insert posts"
  on public.posts
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'shavladzegiorgi@gmail.com');

drop policy if exists "only admin can update posts" on public.posts;
create policy "only admin can update posts"
  on public.posts
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'shavladzegiorgi@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'shavladzegiorgi@gmail.com');

drop policy if exists "only admin can delete posts" on public.posts;
create policy "only admin can delete posts"
  on public.posts
  for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'shavladzegiorgi@gmail.com');
