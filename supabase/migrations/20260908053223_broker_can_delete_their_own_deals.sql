drop policy if exists "brokers can delete their own deals"
on public.deals;

create policy "brokers can delete their own deals"
on public.deals
for delete
to authenticated
using (
    broker_id = auth.uid()
    AND EXISTS (
        select 1
        from public.profiles
        where id = auth.uid()
        AND role = 'broker'
    )
);