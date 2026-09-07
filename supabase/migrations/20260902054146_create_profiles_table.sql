create table if not exists public.profiles(
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null check (role in ('broker', 'buyer')),
    name text not null,
    company text,
    phone text,
    created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "user can only see their own data"
on public.profiles
for select
to authenticated
using (id = auth.uid());