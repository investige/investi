-- Reddit-style upvotes (no downvote) on posts and quizzes. One vote per
-- user per item, removable (click again to un-vote).
--
-- Public counts are exposed only through security-definer functions
-- (get_post_vote_counts/get_quiz_vote_counts below), never the base table
-- with user_id columns — RLS on the base tables restricts SELECT to a
-- user's own row, so nobody can enumerate who voted for what, but everyone
-- can call the count functions and a logged-in user can check their own
-- vote status via the base table.

create table if not exists public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_votes enable row level security;

drop policy if exists "users can read own post votes" on public.post_votes;
create policy "users can read own post votes"
  on public.post_votes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own post votes" on public.post_votes;
create policy "users can insert own post votes"
  on public.post_votes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own post votes" on public.post_votes;
create policy "users can delete own post votes"
  on public.post_votes
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.post_votes to authenticated;

create table if not exists public.quiz_votes (
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (quiz_id, user_id)
);

alter table public.quiz_votes enable row level security;

drop policy if exists "users can read own quiz votes" on public.quiz_votes;
create policy "users can read own quiz votes"
  on public.quiz_votes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own quiz votes" on public.quiz_votes;
create policy "users can insert own quiz votes"
  on public.quiz_votes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own quiz votes" on public.quiz_votes;
create policy "users can delete own quiz votes"
  on public.quiz_votes
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.quiz_votes to authenticated;

-- Public, identity-free vote counts. A plain view would still apply the
-- caller's RLS to the underlying table (a view is not security-definer by
-- default), which would make everyone's count collapse to "just my own
-- votes". Use security-definer functions instead, same pattern as
-- is_admin(), so the aggregation runs with elevated privilege but only
-- ever returns counts — never the underlying user_id rows.
create or replace function public.get_post_vote_counts(post_ids uuid[])
returns table(post_id uuid, votes int)
language sql
security definer
set search_path = public
stable
as $$
  select post_id, count(*)::int as votes
  from public.post_votes
  where post_id = any(post_ids)
  group by post_id;
$$;

revoke all on function public.get_post_vote_counts(uuid[]) from public;
grant execute on function public.get_post_vote_counts(uuid[]) to anon, authenticated;

create or replace function public.get_quiz_vote_counts(quiz_ids uuid[])
returns table(quiz_id uuid, votes int)
language sql
security definer
set search_path = public
stable
as $$
  select quiz_id, count(*)::int as votes
  from public.quiz_votes
  where quiz_id = any(quiz_ids)
  group by quiz_id;
$$;

revoke all on function public.get_quiz_vote_counts(uuid[]) from public;
grant execute on function public.get_quiz_vote_counts(uuid[]) to anon, authenticated;
