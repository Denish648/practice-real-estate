-- Allow authenticated users (e.g. buyers) to view broker profiles for deal listings
create policy "allow authenticated users to view broker profiles"
on public.profiles
for select
to authenticated
using (role = 'broker');
