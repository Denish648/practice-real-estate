"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "cn"
import { ArrowUpRight, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DealFeed } from "@/components/deal-feed"
import { DealSearchField } from "@/components/deal-search-field"
import { getInitials } from "@/lib/utils/format"
import { matchesDealQuery, type FeedDeal } from "@/lib/utils/deal-feed"

/** How many listings the dashboard shows before handing off to Browse Deals. */
const CURATED_COUNT = 6

export type FeedBroker = {
  id: string
  name: string
  company: string | null
  phone: string | null
  avatar_url: string | null
  dealCount: number
}

/**
 * Buyer dashboard board: one search box drives both the broker rail and the
 * deal feed. The feed is a curated slice of the marketplace — Browse Deals is
 * where the full collection lives.
 */
export function BuyerBoard({
  deals,
  brokers,
}: {
  deals: FeedDeal[]
  brokers: FeedBroker[]
}) {
  const [query, setQuery] = useState("")
  const [brokerId, setBrokerId] = useState<string | null>(null)

  const search = query.trim().toLowerCase()
  const isFiltering = search !== "" || brokerId !== null

  const matchingDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (brokerId && deal.broker_id !== brokerId) return false
      return matchesDealQuery(deal, search)
    })
  }, [deals, brokerId, search])

  // unfiltered, the dashboard is a preview; filtering means the buyer is
  // looking for something specific, so every match is worth showing
  const visibleDeals = isFiltering
    ? matchingDeals
    : matchingDeals.slice(0, CURATED_COUNT)

  const visibleBrokers = useMemo(() => {
    if (!search) return brokers

    return brokers.filter(
      (broker) =>
        broker.name.toLowerCase().includes(search) ||
        (broker.company ?? "").toLowerCase().includes(search),
    )
  }, [brokers, search])

  const selectedBroker = brokers.find((broker) => broker.id === brokerId)

  return (
    <div className="flex flex-col gap-6">
      <DealSearchField value={query} onChange={setQuery} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        {/* deal feed — contained, scrollbar hidden */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium tracking-tight">
                {selectedBroker
                  ? `Listings by ${selectedBroker.name}`
                  : "Latest listings"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isFiltering
                  ? `${matchingDeals.length} ${matchingDeals.length === 1 ? "property matches" : "properties match"} your search.`
                  : `Showing ${visibleDeals.length} of ${deals.length} ${deals.length === 1 ? "property" : "properties"} available to you.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isFiltering && (
                <button
                  type="button"
                  onClick={() => {
                    setBrokerId(null)
                    setQuery("")
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3.5" />
                  Clear
                </button>
              )}

              <Link
                href="/dashboard/buyer/browse-deals"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
              >
                Browse deals
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <DealFeed
            deals={visibleDeals}
            contained
            emptyTitle={
              deals.length === 0
                ? "No listings yet"
                : "No listings match your search"
            }
            emptyDescription={
              deals.length === 0
                ? "New deals from brokers will appear here."
                : "Try a different city, broker or keyword."
            }
          />
        </section>

        {/* brokers */}
        <aside className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-medium tracking-tight">
              Discover brokers
            </h2>
            <p className="text-sm text-muted-foreground">
              {brokers.length} {brokers.length === 1 ? "broker" : "brokers"} on
              the board. Pick one to filter the feed.
            </p>
          </div>

          <div className="relative">
            <div className="scrollbar-hidden max-h-[68vh] overflow-y-auto overscroll-contain rounded-2xl ring-1 ring-foreground/10">
              {visibleBrokers.length > 0 ? (
                <ul className="divide-y">
                  {visibleBrokers.map((broker) => {
                    const isSelected = broker.id === brokerId

                    return (
                      <li key={broker.id}>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() =>
                            setBrokerId(isSelected ? null : broker.id)
                          }
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors",
                            isSelected
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted/60",
                          )}
                        >
                          <Avatar className="size-10">
                            <AvatarImage
                              src={broker.avatar_url ?? undefined}
                              alt={broker.name}
                            />
                            <AvatarFallback>
                              {getInitials(broker.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {broker.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {broker.company || "Independent"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground tabular-nums">
                            {broker.dealCount}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No brokers match your search.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
