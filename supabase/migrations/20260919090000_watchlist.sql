-- Per-user stock watchlist: each row is one ticker a user added to their
-- personal list on the /stocks page.

create table if not exists public.watchlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null check (symbol ~ '^[A-Z0-9.]{1,10}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, symbol)
);

alter table public.watchlist enable row level security;

drop policy if exists "users can read own watchlist" on public.watchlist;
create policy "users can read own watchlist"
  on public.watchlist
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own watchlist" on public.watchlist;
create policy "users can insert own watchlist"
  on public.watchlist
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own watchlist" on public.watchlist;
create policy "users can delete own watchlist"
  on public.watchlist
  for delete
  to authenticated
  using (auth.uid() = user_id);
