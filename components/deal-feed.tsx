import { cn } from "cn"
import { Building2 } from "lucide-react"
import { DealFeedCard } from "@/components/deal-feed-card"
import type { FeedDeal } from "@/lib/utils/deal-feed"

/**
 * Shared feed layout.
 *
 * `grid` is the dashboard shape (two-up on wide screens, contained scroll);
 * `single` is the Browse Deals shape — one continuous editorial column that
 * scrolls with the page.
 */
export function DealFeed({
  deals,
  layout = "grid",
  contained = false,
  maxHeight = "max-h-[68vh]",
  hrefFor,
  externalHrefFor,
  actionLabel,
  showStatus,
  emptyTitle = "No listings yet",
  emptyDescription = "New deals from brokers will appear here.",
  emptyAction,
}: {
  deals: FeedDeal[]
  layout?: "grid" | "single"
  contained?: boolean
  maxHeight?: string
  hrefFor?: (deal: FeedDeal) => string
  externalHrefFor?: (deal: FeedDeal) => string | undefined
  actionLabel?: string
  showStatus?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center">
        <Building2 className="size-6 text-muted-foreground" />
        <p className="font-medium">{emptyTitle}</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          {emptyDescription}
        </p>
        {emptyAction}
      </div>
    )
  }

  const cards = (
    <div
      className={cn(
        layout === "single"
          ? "mx-auto flex w-full max-w-2xl flex-col gap-8"
          : "grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2",
      )}
    >
      {deals.map((deal) => (
        <DealFeedCard
          key={deal.id}
          deal={deal}
          size={layout === "single" ? "feature" : "default"}
          href={hrefFor?.(deal)}
          externalHref={externalHrefFor?.(deal)}
          actionLabel={actionLabel}
          showStatus={showStatus}
        />
      ))}
    </div>
  )

  if (!contained) return cards

  return (
    <div className="relative">
      <div
        className={cn(
          "scrollbar-hidden overflow-y-auto overscroll-contain pb-6",
          maxHeight,
        )}
      >
        {cards}
      </div>

      {/* the scrollbar is hidden, so a fade carries "there is more below" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-background to-transparent"
      />
    </div>
  )
}
