alter table public.stops
  add column start_time time,
  add column duration_minutes int check (duration_minutes is null or duration_minutes > 0);
