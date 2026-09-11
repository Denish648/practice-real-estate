-- create deal image table
create table if not exists public.deal_images(
    id uuid primary key default gen_random_uuid(),
    deal_id uuid not null references public.deals(id) on delete cascade,
    path text not null,
    sort_order int not null default 0, 
    created_at timestamptz default now()
);

alter table public.deal_images enable row level security;

-- deals_images RLS : anyone can see public deals image and private deals only seen by their broker 
create policy "views images of accessible deals"
on public.deal_images
for select
to authenticated
using(
    exists(
        select 1 from public.deals
        where deals.id = deal_images.deal_id
        and (is_private = false or deals.broker_id = auth.uid())
    )
);

create policy "broker can insert deal images"
on public.deal_images
for insert
to authenticated
with check (
    exists(
        select 1 from public.deals
        where deals.id = deal_images.deal_id 
        and deals.broker_id = auth.uid()
    )
);

create policy "broker can update their deal images"
on public.deal_images
for update
to authenticated
using(
    exists(
        select 1 from public.deals
        where deals.id = deal_images.deal_id
        and deals.broker_id = auth.uid()
    )
)
with check(
    exists(
        select 1 from public.deals
        where deals.id = deal_images.deal_id
        and deals.broker_id = auth.uid()
    )
);

create policy "broker can delete their deal images"
on public.deal_images
for delete
to authenticated
using(
    exists(
        select 1 from public.deals
        where id = deal_images.deal_id
        and broker_id = auth.uid()
    )
);