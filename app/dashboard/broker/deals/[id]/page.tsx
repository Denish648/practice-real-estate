import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Images,
  Lock,
  MapPin,
} from "lucide-react"
import DealEditForm from "@/components/deal-edit-form"
import { Badge } from "@/components/ui/badge"
import { getDealById } from "@/lib/data/deals"
import { getDealImagesWithSignedUrls } from "@/lib/data/deal-images"
import { getUser } from "@/lib/data/user"
import { formatListedDate } from "@/lib/utils/deal-feed"
import { formatINRPrice } from "@/lib/utils/format"
import { dealPath } from "@/lib/utils/slug"

export default async function BrokerDealDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { user, error: userError } = await getUser()
  if (userError || !user) throw new Error("unauthorized")

  const { data: deal, error } = await getDealById(id)
  if (error || !deal || deal.broker_id !== user.id) notFound()

  const { images } = await getDealImagesWithSignedUrls(
    deal.id,
    deal.broker_id,
    deal.is_private,
  )

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Link
        href="/dashboard/broker/my-deals"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to My Deals
      </Link>

      {/* what this listing looks like right now */}
      <section className="rounded-2xl bg-secondary p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <Badge variant={deal.is_private ? "secondary" : "default"}>
              {deal.is_private && <Lock />}
              {deal.is_private ? "Private" : "Public"}
            </Badge>

            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              {deal.title}
            </h1>

            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground capitalize">
              <MapPin className="size-4" />
              {deal.city}
            </p>
          </div>

          <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
            {formatINRPrice(deal.price)}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-foreground/10 pt-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            Listed {formatListedDate(deal.created_at)}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Images className="size-4" />
            {images.length} {images.length === 1 ? "photo" : "photos"}
          </span>

          {!deal.is_private && deal.broker && (
            <Link
              href={dealPath(deal.broker.name, deal.title)}
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
            >
              View public page
              <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
      </section>

      <div className="space-y-1">
        <h2 className="text-lg font-medium tracking-tight">Edit listing</h2>
        <p className="text-sm text-muted-foreground">
          Update the details, manage its photos, or delete it.
        </p>
      </div>

      <DealEditForm deal={deal} initialImages={images} />
    </div>
  )
}
