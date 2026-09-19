-- Public display name for each user, shown on posts (and future comments).
-- Anyone who hasn't set one gets "რიგითი" + 6 random, non-repeating digits.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "anyone can read profiles" on public.profiles;
create policy "anyone can read profiles"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

-- "რიგითი" + 6 distinct random digits, retried until it doesn't collide
-- with an existing username.
create or replace function public.generate_default_username()
returns text
language plpgsql
as $$
declare
  digits text[] := array['0','1','2','3','4','5','6','7','8','9'];
  shuffled text[];
  candidate text;
  i int;
  j int;
  tmp text;
begin
  loop
    shuffled := digits;
    for i in reverse 10..2 loop
      j := 1 + floor(random() * i)::int;
      tmp := shuffled[i];
      shuffled[i] := shuffled[j];
      shuffled[j] := tmp;
    end loop;

    candidate := 'რიგითი';
    for i in 1..6 loop
      candidate := candidate || shuffled[i];
    end loop;

    exit when not exists (
      select 1 from public.profiles where username = candidate
    );
  end loop;

  return candidate;
end;
$$;

-- Auto-create a profile (with a default username) for every new signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, username)
  values (new.id, public.generate_default_username())
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who signed up before this migration existed.
insert into public.profiles (user_id, username)
select id, public.generate_default_username()
from auth.users
where id not in (select user_id from public.profiles);
