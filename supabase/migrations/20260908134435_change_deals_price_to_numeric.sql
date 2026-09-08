alter table public.deals
alter column price type numeric
using price::numeric;