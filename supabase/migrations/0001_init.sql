-- Japan trip itinerary tracker: initial schema + RLS
-- Run this once in the Supabase SQL Editor for the project.

create extension if not exists pgcrypto;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (trip_id, user_id)
);

create table public.days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_date date,
  label text not null, -- e.g. "Day 3: Kyoto"
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.stops (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_id uuid references public.days(id) on delete set null, -- null = unscheduled inbox pin
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  place_id text, -- Google Place ID
  category text not null default 'other'
    check (category in ('food', 'sight', 'hotel', 'transport', 'shopping', 'other')),
  note text,
  sort_order int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index stops_trip_id_idx on public.stops(trip_id);
create index stops_day_id_idx on public.stops(day_id);
create index days_trip_id_idx on public.days(trip_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stops_set_updated_at
before update on public.stops
for each row execute function public.set_updated_at();

-- Row Level Security

alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.days enable row level security;
alter table public.stops enable row level security;

create or replace function public.is_trip_member(t_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = t_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

create policy "trip members can read trips" on public.trips
  for select using (public.is_trip_member(id));

create policy "trip members can update trips" on public.trips
  for update using (public.is_trip_member(id));

create policy "members can see their own memberships" on public.trip_members
  for select using (user_id = auth.uid());

create policy "trip members can manage days" on public.days
  for all using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));

create policy "trip members can manage stops" on public.stops
  for all using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));
