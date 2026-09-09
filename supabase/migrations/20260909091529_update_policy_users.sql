create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- preventing user from changing role
create or replace function public.prevent_role_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if new.role is distinct from old.role then
        raise exception 'Users cant change their role';
    end if;

    return new;
end;
$$;

create trigger prevent_role_update
before update on public.profiles
for each row
execute function public.prevent_role_update();