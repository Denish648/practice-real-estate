-- upload : broker can upload to their own bucket folder
create policy "broker can upload to own folder"
on storage.objects
for insert
to authenticated
with check(
    bucket_id = 'deal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
);

--select : select image from deal-image storage bucket 
create policy "users can view accessbile deal image"
on storage.objects
for select
to authenticated
using(
    bucket_id = 'deal-images'
    and exists(
        select 1 from public.deals
        where (storage.foldername(name))[2] = deals.id::text
        and (
            deals.is_private = false
            or deals.broker_id = auth.uid()
        )
    )
);

-- Delete: Brokers can only delete from their own broker_id folder
create policy "brokers can delete from own folder"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'deal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
);