-- Tracks which posts a signed-in user has already opened, so we can
-- recommend posts they haven't read yet instead of ones they have.

create table if not exists public.post_views (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_views enable row level security;

drop policy if exists "users can read own post views" on public.post_views;
create policy "users can read own post views"
  on public.post_views
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users can insert own post views" on public.post_views;
create policy "users can insert own post views"
  on public.post_views
  for insert
  to authenticated
  with check (auth.uid() = user_id);

grant select, insert on public.post_views to authenticated;
