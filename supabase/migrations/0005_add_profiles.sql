create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  label text not null
);

alter table public.profiles enable row level security;

create policy "authenticated users can read profiles" on public.profiles
  for select using (auth.uid() is not null);

create policy "users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

alter table public.todos
  add column created_by uuid references auth.users(id);
