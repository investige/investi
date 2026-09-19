-- Move "who can publish news" out of a hardcoded email into a real table,
-- and add categories so posts can be organized/filtered.

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- security definer so checking "am I admin" doesn't recurse into RLS on
-- this same table (the function runs with the owner's privileges).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

drop policy if exists "admins can read admin list" on public.admins;
create policy "admins can read admin list"
  on public.admins
  for select
  to authenticated
  using (public.is_admin());

-- Seed the current hardcoded admin so nothing loses access.
insert into public.admins (user_id)
select id from auth.users where email = 'shavladzegiorgi@gmail.com'
on conflict (user_id) do nothing;

-- Posts: categories
alter table public.posts
  add column if not exists category text not null default 'ზოგადი';

alter table public.posts drop constraint if exists posts_category_check;
alter table public.posts add constraint posts_category_check
  check (category in ('ზოგადი', 'ბაზრის სიახლეები', 'განათლება', 'ანალიზი'));

-- Posts: switch admin policies from a hardcoded email to is_admin()
drop policy if exists "only admin can insert posts" on public.posts;
create policy "only admin can insert posts"
  on public.posts
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "only admin can update posts" on public.posts;
create policy "only admin can update posts"
  on public.posts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "only admin can delete posts" on public.posts;
create policy "only admin can delete posts"
  on public.posts
  for delete
  to authenticated
  using (public.is_admin());
