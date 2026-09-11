"use client"

import { useMemo, useState } from "react"
import { cn } from "cn"
import { DealFeed } from "@/components/deal-feed"
import { DealSearchField } from "@/components/deal-search-field"
import { matchesDealQuery, type FeedDeal } from "@/lib/utils/deal-feed"

/**
 * Browse Deals is the discovery surface: one continuous column of listings,
 * filtered by the same search rules as the dashboard so both views stay in
 * step. Scrolling here is the page's own — nothing is contained.
 */
export function BrowseDealsFeed({ deals }: { deals: FeedDeal[] }) {
  const [query, setQuery] = useState("")
  const [city, setCity] = useState<string | null>(null)

  const cities = useMemo(
    () => [...new Set(deals.map((deal) => deal.city))].sort(),
    [deals],
  )

  const visibleDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (city && deal.city !== city) return false
      return matchesDealQuery(deal, query)
    })
  }, [deals, city, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <DealSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search by title, city or broker"
        />

        {cities.length > 1 && (
          <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <FilterChip active={city === null} onClick={() => setCity(null)}>
              All cities
            </FilterChip>

            {cities.map((option) => (
              <FilterChip
                key={option}
                active={city === option}
                onClick={() => setCity(city === option ? null : option)}
              >
                <span className="capitalize">{option}</span>
              </FilterChip>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {visibleDeals.length}{" "}
          {visibleDeals.length === 1 ? "listing" : "listings"}
          {city ? ` in ${city}` : ""}
          {query.trim() ? ` matching “${query.trim()}”` : ""}.
        </p>
      </div>

      <DealFeed
        deals={visibleDeals}
        layout="single"
        emptyTitle={
          deals.length === 0
            ? "No listings available"
            : "No listings match your search"
        }
        emptyDescription={
          deals.length === 0
            ? "Check back once brokers publish their deals."
            : "Try a different city, broker or keyword."
        }
      />
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "text-muted-foreground hover:border-foreground/25 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
