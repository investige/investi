-- Same upvote pattern as post_votes/quiz_votes, now for comments.

create table if not exists public.comment_votes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.comment_votes enable row level security;

drop policy if exists "users can read own comment votes" on public.comment_votes;
create policy "users can read own comment votes"
  on public.comment_votes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own comment votes" on public.comment_votes;
create policy "users can insert own comment votes"
  on public.comment_votes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own comment votes" on public.comment_votes;
create policy "users can delete own comment votes"
  on public.comment_votes
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, delete on public.comment_votes to authenticated;

-- Public, identity-free counts (see get_post_vote_counts for why this has
-- to be a security-definer function rather than a plain view).
create or replace function public.get_comment_vote_counts(comment_ids uuid[])
returns table(comment_id uuid, votes int)
language sql
security definer
set search_path = public
stable
as $$
  select comment_id, count(*)::int as votes
  from public.comment_votes
  where comment_id = any(comment_ids)
  group by comment_id;
$$;

revoke all on function public.get_comment_vote_counts(uuid[]) from public;
grant execute on function public.get_comment_vote_counts(uuid[]) to anon, authenticated;
