create table if not exists public.deals(
    id uuid primary key default gen_random_uuid(),
    broker_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    city text not null,
    price text not null,
    is_private boolean not null default false,
    created_at timestamptz default now()
);

alter table deals enable row level security;

create policy "buyer must only see public deals"
on public.deals
for select
to anon,authenticated
using (is_private = false);