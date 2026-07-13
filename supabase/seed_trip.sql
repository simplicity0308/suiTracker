-- Run AFTER 0001_init.sql, and AFTER creating the 2 auth users in
-- Supabase Dashboard -> Authentication -> Users.
--
-- Replace the two placeholder UUIDs below with the real user IDs
-- (copy them from the Authentication -> Users table).

with new_trip as (
  insert into public.trips (name, start_date, end_date)
  values ('Japan Trip', '2026-09-01', '2026-09-14')
  returning id
)
insert into public.trip_members (trip_id, user_id)
select new_trip.id, u.id
from new_trip
cross join (
  values
    ('00000000-0000-0000-0000-000000000000'::uuid), -- replace: user 1 id
    ('00000000-0000-0000-0000-000000000000'::uuid)  -- replace: user 2 id
) as u(id);
