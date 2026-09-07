create policy "only authenticated broker can view their own private deals"
on public.deals
for select
to authenticated
using (
        EXISTS(
            select 1 from profiles
            where auth.uid() = id
            and role = 'broker'
        )
        and 
        broker_id = auth.uid()
    ) 