-- create avatars bucket
insert into storage.buckets (id,name,public)
values ('avatars','avatars',true);

-- users can upload to their own folder
create policy "Users can upload own avatars"
on storage.objects
for insert 
to authenticated
with check(
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);

--users can delete their own avatars
create policy "Users can delete own avatars"
on storage.objects
for delete
to authenticated
using(
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
);