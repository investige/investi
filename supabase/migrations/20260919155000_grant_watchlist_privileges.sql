-- Same missing-grant bug as posts (see 20260919140000_grant_posts_update_delete.sql):
-- `authenticated` had no SELECT/INSERT/DELETE on watchlist at all, so the
-- whole feature silently failed for every user since it shipped.

grant select, insert, delete on public.watchlist to authenticated;
