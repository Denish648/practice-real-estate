-- allow broker to update their own deal
create policy "broker can update their own deals"
on public.deals
for update
to authenticated
using(
    broker_id = auth.uid()
    and EXISTS(
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'broker'
    )
)
with check(
    broker_id = auth.uid()
    and EXISTS(
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'broker'
    )
);

-- allow broker to delete their own deals
create policy "brokers can delete their own deals"
on public.deals
to authenticated
using(
    broker_id = auth.uid()
    and EXISTS(
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'broker'
    )
)