create table public.todos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  title text not null,
  due_date date,
  done boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index todos_trip_id_idx on public.todos(trip_id);

alter table public.todos enable row level security;

create policy "trip members can manage todos" on public.todos
  for all using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));
