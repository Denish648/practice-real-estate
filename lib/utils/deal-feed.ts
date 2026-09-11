import type { Deal, PublicDeal } from "@/lib/types/deal"

/**
 * View model behind every deal card in the product — buyer dashboard, Browse
 * Deals and the broker's recent listings all render the same shape, so a deal
 * reads identically wherever it appears.
 */
export type FeedDeal = {
  id: string
  title: string
  city: string
  price: number
  created_at: string | null
  broker_id: string
  brokerName: string | null
  brokerCompany: string | null
  brokerAvatar: string | null
  isPrivate: boolean
  imageUrl?: string
}

type BrokerCard = {
  name: string | null
  company: string | null
  avatar_url: string | null
}

/**
 * `broker` overrides the joined broker row — the broker's own listings come
 * from `getDeals(user.id)`, which does not join `profiles`, so the page passes
 * the signed-in broker's profile instead.
 */
export function toFeedDeals(
  deals: (Deal | PublicDeal)[],
  covers: Record<string, string>,
  broker?: BrokerCard,
): FeedDeal[] {
  return deals.map((deal) => {
    const joined = "broker" in deal ? deal.broker : null
    const card = broker ?? joined

    return {
      id: deal.id,
      title: deal.title,
      city: deal.city,
      price: deal.price,
      created_at: deal.created_at,
      broker_id: deal.broker_id,
      brokerName: card?.name ?? null,
      brokerCompany: card?.company ?? null,
      brokerAvatar: card?.avatar_url ?? null,
      isPrivate: deal.is_private,
      imageUrl: covers[deal.id],
    }
  })
}

/** Shared matcher so the dashboard and Browse Deals search behave the same. */
export function matchesDealQuery(deal: FeedDeal, query: string) {
  const search = query.trim().toLowerCase()
  if (!search) return true

  return (
    deal.title.toLowerCase().includes(search) ||
    deal.city.toLowerCase().includes(search) ||
    (deal.brokerName ?? "").toLowerCase().includes(search) ||
    (deal.brokerCompany ?? "").toLowerCase().includes(search)
  )
}

export function formatListedDate(createdAt: string | null) {
  if (!createdAt) return "Recently listed"

  return new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
