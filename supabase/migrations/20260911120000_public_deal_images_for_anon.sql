-- Public deals are already selectable by `anon` (see create_deals_table.sql), but
-- their images were not, so the public landing page could not render any photos.
-- These policies extend the same "visible when the parent deal is visible" rule to
-- anonymous visitors, strictly for deals that are already public.
-- Private deals stay broker-only: is_private = false is required in both policies.

create policy "anon can view images of public deals"
on public.deal_images
for select
to anon
using(
    exists(
        select 1 from public.deals
        where deals.id = deal_images.deal_id
        and deals.is_private = false
    )
);

create policy "anon can view public deal image files"
on storage.objects
for select
to anon
using(
    bucket_id = 'deal-images'
    and exists(
        select 1 from public.deals
        where (storage.foldername(name))[2] = deals.id::text
        and deals.is_private = false
    )
);
