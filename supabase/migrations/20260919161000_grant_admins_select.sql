-- Same missing-grant class of bug as posts/watchlist. Not currently
-- exploited by any app code path (is_admin() is SECURITY DEFINER and
-- bypasses this), but the "admins can read admin list" RLS policy implies
-- authenticated should be able to SELECT directly too — fix it for
-- consistency before something relies on it.

grant select on public.admins to authenticated;
