-- Public deals are readable by `anon` (see create_deals_table.sql) and, since
-- public_deal_images_for_anon.sql, so are their photos. The broker contact card
-- on the public /discover pages needs one more piece: the broker's own profile
-- row. Brokers are the advertising party here, so their card is public by
-- design; buyer profiles stay owner-only.
--
-- Mirrors "allow authenticated users to view broker profiles", which grants the
-- same rows to `authenticated`.

create policy "anon can view broker profiles"
on public.profiles
for select
to anon
using (role = 'broker');
