alter table public.todos
  add column day_id uuid references public.days(id) on delete set null;
