-- Multiple quizzes instead of one hardcoded set of questions. Admin creates
-- quizzes with a thumbnail; anyone can read/take them.

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thumbnail_url text,
  author_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.quizzes enable row level security;

drop policy if exists "anyone can read quizzes" on public.quizzes;
create policy "anyone can read quizzes"
  on public.quizzes
  for select
  to anon, authenticated
  using (true);

drop policy if exists "only admin can insert quizzes" on public.quizzes;
create policy "only admin can insert quizzes"
  on public.quizzes
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "only admin can delete quizzes" on public.quizzes;
create policy "only admin can delete quizzes"
  on public.quizzes
  for delete
  to authenticated
  using (public.is_admin());

grant select on public.quizzes to anon, authenticated;
grant insert, delete on public.quizzes to authenticated;

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options text[] not null,
  correct_index int not null,
  position int not null default 0
);

alter table public.quiz_questions enable row level security;

drop policy if exists "anyone can read quiz questions" on public.quiz_questions;
create policy "anyone can read quiz questions"
  on public.quiz_questions
  for select
  to anon, authenticated
  using (true);

drop policy if exists "only admin can insert quiz questions" on public.quiz_questions;
create policy "only admin can insert quiz questions"
  on public.quiz_questions
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "only admin can delete quiz questions" on public.quiz_questions;
create policy "only admin can delete quiz questions"
  on public.quiz_questions
  for delete
  to authenticated
  using (public.is_admin());

grant select on public.quiz_questions to anon, authenticated;
grant insert, delete on public.quiz_questions to authenticated;

-- Link attempts to a specific quiz (table has 0 rows so far, safe to make required).
alter table public.quiz_attempts
  add column if not exists quiz_id uuid references public.quizzes(id) on delete cascade;
alter table public.quiz_attempts
  alter column quiz_id set not null;

-- Preserve the original hardcoded quiz as real content instead of losing it.
insert into public.quizzes (id, title)
values ('00000000-0000-0000-0000-000000000001', 'საბაზისო ცოდნა ინვესტიციებში')
on conflict (id) do nothing;

insert into public.quiz_questions (quiz_id, question, options, correct_index, position)
select * from (values
  ('00000000-0000-0000-0000-000000000001'::uuid, 'რა არის აქცია?', array['კომპანიის ვალი','კომპანიის წილი','ბანკის დეპოზიტი'], 1, 0),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'რას ნიშნავს ETF?', array['ერთი კომპანიის აქცია','ფონდი, რომელშიც ბევრი კომპანიაა','კრიპტოვალუტა'], 1, 1),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Buy & Hold რას ნიშნავს?', array['ყოველდღე ყიდვა-გაყიდვა','ყიდვა და დიდი ხნით შენახვა','მხოლოდ ოქროს ყიდვა'], 1, 2),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'დივერსიფიკაცია რატომ კეთდება?', array['რომ ერთ კომპანიაზე არ იყოს ყველაფერი','რომ მეტი საკომისიო გადაიხადო','რომ მხოლოდ ერთი აქცია იყიდო'], 0, 3),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'ვინ არის უორენ ბაფეტი?', array['კრიპტოს შემქმნელი','ცნობილი გრძელვადიანი ინვესტორი','საქართველოს ბანკის დამფუძნებელი'], 1, 4)
) as v(quiz_id, question, options, correct_index, position)
where not exists (
  select 1 from public.quiz_questions where quiz_id = '00000000-0000-0000-0000-000000000001'
);
