-- trigger function - new user data into profiles table from auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles(
        id,
        name,
        company,
        phone,
        role
    )
    values(
        new.id,
        new.raw_user_metadata->>"name",
        new.raw_user_metadata->>"company",
        new.raw_user_metadata->>"phone",
        new.raw_user_metadata->>"role"
    );

    return new;
end;
$$;


-- trigger - when new user added in auth
create trigger on_auth_users_created
after insert on auth.users
for each row
execute function public.handle_new_user();