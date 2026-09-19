-- Store quiz results per user so a profile page can show attempt history.

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score int not null,
  total int not null,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

drop policy if exists "users can read own quiz attempts" on public.quiz_attempts;
create policy "users can read own quiz attempts"
  on public.quiz_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own quiz attempts" on public.quiz_attempts;
create policy "users can insert own quiz attempts"
  on public.quiz_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- RLS policies alone don't grant access — Postgres checks table-level
-- privileges first (see supabase/migrations/20260919140000_grant_posts_update_delete.sql
-- for the bug this caused on `posts`). Grant them explicitly up front here.
grant select, insert on public.quiz_attempts to authenticated;
