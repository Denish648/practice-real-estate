import Image from "next/image"
import Link from "next/link"
import { cn } from "cn"
import {
  ArrowUpRight,
  CalendarDays,
  ImageOff,
  Lock,
  MapPin,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatINRPrice, getInitials } from "@/lib/utils/format"
import { formatListedDate, type FeedDeal } from "@/lib/utils/deal-feed"

export type { FeedDeal }

/**
 * The one deal card in the product. Buyer dashboard and Browse Deals render it
 * against the public deal routes; the broker dashboard points it at the edit
 * route and turns on the visibility badge.
 */
export function DealFeedCard({
  deal,
  href,
  actionLabel = "See more",
  size = "default",
  showStatus = false,
  externalHref,
}: {
  deal: FeedDeal
  href?: string
  actionLabel?: string
  size?: "default" | "feature"
  showStatus?: boolean
  externalHref?: string
}) {
  const target = href ?? `/dashboard/buyer/deals/${deal.id}`
  const isFeature = size === "feature"

  return (
    <article className="group/card overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="size-9">
          <AvatarImage
            src={deal.brokerAvatar ?? undefined}
            alt={deal.brokerName ?? "Broker"}
          />
          <AvatarFallback>{getInitials(deal.brokerName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {deal.brokerName ?? "Broker"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {deal.brokerCompany || "Independent"}
          </p>
        </div>

        <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
          <CalendarDays className="size-3.5" />
          {formatListedDate(deal.created_at)}
        </span>

        {externalHref && (
          <Link
            href={externalHref}
            title="Open the public listing page"
            aria-label="Open the public listing page"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowUpRight className="size-4" />
          </Link>
        )}
      </div>

      <Link href={target} className="block focus-visible:outline-none">
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            isFeature ? "aspect-3/2" : "aspect-16/10",
          )}
        >
          {deal.imageUrl ? (
            <Image
              src={deal.imageUrl}
              alt={deal.title}
              fill
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
              sizes={
                isFeature
                  ? "(max-width: 768px) 100vw, 680px"
                  : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 520px"
              }
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <ImageOff className="size-6" />
              <span className="text-xs">No photos yet</span>
            </div>
          )}

          {showStatus ? (
            <span
              className={cn(
                "absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium backdrop-blur-sm",
                deal.isPrivate
                  ? "bg-foreground/85 text-background"
                  : "bg-background/90 text-foreground",
              )}
            >
              {deal.isPrivate && <Lock className="size-3" />}
              {deal.isPrivate ? "Private" : "Public"}
            </span>
          ) : (
            <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
              For sale
            </span>
          )}

          {/* scrim keeps the price readable over any photo */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-14">
            <p
              className={cn(
                "font-semibold tracking-tight tabular-nums text-white",
                isFeature ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
              )}
            >
              {formatINRPrice(deal.price)}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-white/85",
                isFeature ? "text-base" : "text-sm",
              )}
            >
              {deal.title}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground capitalize">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{deal.city}</span>
            <span className="text-muted-foreground/60 sm:hidden">
              · {formatListedDate(deal.created_at)}
            </span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium underline-offset-4 group-hover/card:underline">
            {actionLabel}
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </Link>
    </article>
  )
}
