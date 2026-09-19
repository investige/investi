-- RLS policies alone aren't enough: Postgres also requires the base table
-- GRANT before RLS is even evaluated. `authenticated` had INSERT/SELECT on
-- `posts` but never UPDATE/DELETE, so admin edit/delete silently affected
-- 0 rows (Postgres blocked them at the grant layer, before the "is_admin()"
-- policy check ran).

grant update, delete on public.posts to authenticated;
