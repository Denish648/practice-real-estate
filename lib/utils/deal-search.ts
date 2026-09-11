import type { Deal } from "@/lib/types/deal"

export type SearchFilters = {
  q: string
  city: string
  max: string
  sort: string
}

/** Reads one search param, collapsing the `string[]` form Next may hand back. */
export function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): SearchFilters {
  return {
    q: readParam(params.q),
    city: readParam(params.city) || "any",
    max: readParam(params.max) || "any",
    sort: readParam(params.sort) || "newest",
  }
}

export function isFiltered(filters: SearchFilters) {
  return filters.q !== "" || filters.city !== "any" || filters.max !== "any"
}

export function applyFilters<T extends Deal>(
  deals: T[],
  filters: SearchFilters,
) {
  let result = deals

  if (filters.q) {
    const query = filters.q.toLowerCase()
    result = result.filter(
      (deal) =>
        deal.title.toLowerCase().includes(query) ||
        deal.city.toLowerCase().includes(query),
    )
  }

  if (filters.city !== "any") {
    result = result.filter((deal) => deal.city === filters.city)
  }

  if (filters.max !== "any") {
    const maxPrice = Number(filters.max)
    result = result.filter((deal) => deal.price <= maxPrice)
  }

  // deals arrive newest first, so only the price sorts need reordering
  if (filters.sort === "price-asc") {
    result = [...result].sort((a, b) => a.price - b.price)
  } else if (filters.sort === "price-desc") {
    result = [...result].sort((a, b) => b.price - a.price)
  }

  return result
}
