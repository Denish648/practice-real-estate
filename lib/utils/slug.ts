/**
 * URL slugs for the public `/discover` routes.
 *
 * Nothing is stored in the database — a slug is derived from the broker name
 * and the deal title on every render, and resolved back by comparing derived
 * slugs. `getPublicDealBySlug` in `lib/data/deals.ts` is the reader side.
 */
export function slugify(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || ""
  )
}

export function brokerSlug(name: string | null | undefined) {
  return slugify(name ?? "") || "broker"
}

export function dealSlug(title: string) {
  return slugify(title) || "listing"
}

/** `/discover/{broker-name}/{deal-title}` */
export function dealPath(brokerName: string | null | undefined, title: string) {
  return `/discover/${brokerSlug(brokerName)}/${dealSlug(title)}`
}
