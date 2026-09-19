-- Comments on posts. Anyone can read; only signed-in users can write.
-- A user can delete their own comment; admin can delete any (moderation).

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

drop policy if exists "anyone can read comments" on public.comments;
create policy "anyone can read comments"
  on public.comments
  for select
  to anon, authenticated
  using (true);

drop policy if exists "users can insert own comments" on public.comments;
create policy "users can insert own comments"
  on public.comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own comments" on public.comments;
create policy "users can delete own comments"
  on public.comments
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "admin can delete any comment" on public.comments;
create policy "admin can delete any comment"
  on public.comments
  for delete
  to authenticated
  using (public.is_admin());

grant select on public.comments to anon, authenticated;
grant insert, delete on public.comments to authenticated;
