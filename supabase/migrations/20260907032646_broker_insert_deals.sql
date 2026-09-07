create policy "authenticated brokers can insert their own deals"
on public.deals
for insert
to authenticated
with check (
    broker_id = auth.uid()
);