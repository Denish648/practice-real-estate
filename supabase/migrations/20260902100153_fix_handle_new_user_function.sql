create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        name,
        company,
        phone,
        role
    )
    values (
        new.id,
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'company',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'role'
    );

    return new;
end;
$$;