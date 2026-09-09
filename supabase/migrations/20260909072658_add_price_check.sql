alter table public.deals
add constraint deal_price_non_negative
check (price >= 0);