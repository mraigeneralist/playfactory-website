-- One-time wipe of all customer accounts + their bookings.
-- Run in Supabase SQL Editor. Idempotent — safe to re-run.
--
-- This deletes:
--   • every row in public.bookings (orphaned by user wipe anyway)
--   • every row in public.profiles  (cascades via FK)
--   • every user in auth.users      (the actual account)
--
-- Sports + blocked_slots are kept (those are catalog data, not user data).

delete from public.bookings;
delete from public.profiles;
delete from auth.users;

-- Sanity check — these should all return 0
-- select count(*) from auth.users;
-- select count(*) from public.profiles;
-- select count(*) from public.bookings;
