drop policy if exists "authenticated brokers can insert their own deals"
on public.deals;

create policy "authenticated brokers can insert their own deals"
on public.deals
for insert
to authenticated
with check (
    broker_id = auth.uid()
    AND EXISTS(select 1 from profiles where id = auth.uid() and role = 'broker')
);