import Image from "next/image"
import Link from "next/link"
import { CalendarDays, ImageOff, MapPin } from "lucide-react"
import { formatINRPrice } from "@/lib/utils/format"
import { dealPath } from "@/lib/utils/slug"
import type { Deal } from "@/lib/types/deal"

function formatListedDate(createdAt: string | null) {
  if (!createdAt) return "Recently listed"

  return new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function PropertyCard({
  deal,
  imageUrl,
  brokerName,
}: {
  deal: Deal
  imageUrl?: string
  brokerName?: string | null
}) {
  return (
    // public detail page — no account needed
    <Link href={dealPath(brokerName, deal.title)} className="group block">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={deal.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ImageOff className="size-6" />
          </div>
        )}

        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-neutral-900">
          For Sale
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5 capitalize">
          <MapPin className="size-3.5" />
          {deal.city}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {formatListedDate(deal.created_at)}
        </span>
      </div>

      <h3 className="mt-1.5 text-base font-medium text-neutral-900 group-hover:underline">
        {deal.title}
      </h3>

      <div className="mt-1 flex items-baseline gap-3">
        <span className="font-semibold tabular-nums text-neutral-900">
          {formatINRPrice(deal.price)}
        </span>
        <span className="text-xs text-neutral-500">View details</span>
      </div>
    </Link>
  )
}
