import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BrowseDealsFeed } from "@/components/browse-deals-feed"
import { getPublicDeals } from "@/lib/data/deals"
import { getDealCoverImages } from "@/lib/data/deal-images"
import { getUser } from "@/lib/data/user"
import { toFeedDeals } from "@/lib/utils/deal-feed"

export default async function BrowseDeals() {
  const { user, error: userError } = await getUser()
  if (userError) throw userError
  if (!user) throw new Error("Unauthorized")

  const { data: deals, error: dealsError } = await getPublicDeals()
  if (dealsError) throw dealsError
  if (!deals) throw new Error("Deals not found")

  const { covers } = await getDealCoverImages(deals.map((deal) => deal.id))
  const feedDeals = toFeedDeals(deals, covers)

  const cities = new Set(deals.map((deal) => deal.city)).size

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <Link
          href="/dashboard/buyer"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Browse Deals
          </h1>
          <p className="text-sm text-muted-foreground">
            Every listing on the board — {deals.length}{" "}
            {deals.length === 1 ? "property" : "properties"} across {cities}{" "}
            {cities === 1 ? "city" : "cities"}. Open one to see the full photo
            set and the broker behind it.
          </p>
        </div>
      </div>

      <BrowseDealsFeed deals={feedDeals} />
    </div>
  )
}
