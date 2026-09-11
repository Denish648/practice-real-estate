import Link from "next/link"
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Globe,
  Images,
  IndianRupee,
  Lock,
  MapPin,
  PlusCircle,
  UserRound,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "@/components/stat-card"
import { DealFeed } from "@/components/deal-feed"
import { getDeals } from "@/lib/data/deals"
import { getDealCoverImages } from "@/lib/data/deal-images"
import { getProfile } from "@/lib/data/profile"
import { getUser } from "@/lib/data/user"
import { toFeedDeals } from "@/lib/utils/deal-feed"
import { formatINRPrice, getInitials } from "@/lib/utils/format"
import { dealPath } from "@/lib/utils/slug"

/** How many listings the overview shows before handing off to My Deals. */
const RECENT_COUNT = 6

export default async function BrokerDashboard() {
  const { user, error: userError } = await getUser()
  if (userError) throw userError
  if (!user) throw new Error("Unauthorized")

  const { profileData: profile, error: profileError } = await getProfile()
  if (profileError) throw profileError
  if (!profile) throw new Error("Profile not found")

  const { data: deals, error: dealsError } = await getDeals(user.id)
  if (dealsError) throw dealsError
  if (!deals) throw new Error("Deals not found")

  const { covers } = await getDealCoverImages(deals.map((deal) => deal.id))

  const publicDeals = deals.filter((deal) => !deal.is_private).length
  const privateDeals = deals.length - publicDeals
  const totalPrice = deals.reduce((total, deal) => total + deal.price, 0)
  const averagePrice = deals.length ? Math.round(totalPrice / deals.length) : 0
  const withPhotos = deals.filter((deal) => covers[deal.id]).length

  const cityCounts = deals.reduce<Record<string, number>>((counts, deal) => {
    counts[deal.city] = (counts[deal.city] ?? 0) + 1
    return counts
  }, {})

  const cities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])

  const recentDeals = toFeedDeals(
    [...deals]
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
      .slice(0, RECENT_COUNT),
    covers,
    profile,
  )

  return (
    <div className="flex flex-col gap-6">
      {/* workspace band */}
      <section className="overflow-hidden rounded-3xl bg-secondary ring-1 ring-foreground/5">
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 space-y-2">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Broker workspace
              </p>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
                {profile.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {profile.company || "Independent broker"} · {deals.length}{" "}
                {deals.length === 1 ? "listing" : "listings"} under management.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/dashboard/broker/create-deal">
                  <PlusCircle />
                  Create deal
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/broker/my-deals">
                  <Briefcase />
                  Manage listings
                </Link>
              </Button>
            </div>
          </div>

          {deals.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-foreground/10 pt-5 text-sm">
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Cities covered</span>
                <span className="font-medium tabular-nums">
                  {cities.length}
                </span>
              </span>

              <span className="inline-flex items-center gap-2">
                <IndianRupee className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Average ask</span>
                <span className="font-medium tabular-nums">
                  {formatINRPrice(averagePrice)}
                </span>
              </span>

              <span className="inline-flex items-center gap-2">
                <Images className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">With photos</span>
                <span className="font-medium tabular-nums">
                  {withPhotos} of {deals.length}
                </span>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* portfolio statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total listings"
          value={deals.length}
          icon={<Briefcase />}
        />
        <StatCard label="Public" value={publicDeals} icon={<Globe />} />
        <StatCard label="Private" value={privateDeals} icon={<Lock />} />
        <StatCard
          label="Portfolio value"
          value={formatINRPrice(totalPrice)}
          icon={<IndianRupee />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        {/* recent listings */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium tracking-tight">
                Recent listings
              </h2>
              <p className="text-sm text-muted-foreground">
                Your newest {recentDeals.length} of {deals.length}. Open one to
                edit its details or photos.
              </p>
            </div>

            <Link
              href="/dashboard/broker/my-deals"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/85"
            >
              Manage all
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <DealFeed
            deals={recentDeals}
            contained
            showStatus
            actionLabel="Manage"
            hrefFor={(deal) => `/dashboard/broker/deals/${deal.id}`}
            externalHrefFor={(deal) =>
              deal.isPrivate ? undefined : dealPath(deal.brokerName, deal.title)
            }
            emptyTitle="No listings yet"
            emptyDescription="Create your first deal and it will show up here, photos and all."
            emptyAction={
              <Button size="sm" className="mt-1" asChild>
                <Link href="/dashboard/broker/create-deal">
                  Create your first deal
                </Link>
              </Button>
            }
          />
        </section>

        <aside className="flex flex-col gap-6">
          {/* business profile */}
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage
                  src={profile.avatar_url ?? undefined}
                  alt={profile.name}
                />
                <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{profile.name}</p>
                <p className="inline-flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                  <Building2 className="size-3.5 shrink-0" />
                  {profile.company || "Independent"}
                </p>
              </div>

              <Badge variant="outline" className="shrink-0 capitalize">
                {profile.role}
              </Badge>
            </div>

            <Separator className="my-4" />

            <p className="text-sm text-muted-foreground">
              This card is what buyers see on every public listing you publish.
            </p>

            <div className="mt-3 text-sm">
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{profile.phone || "Not provided"}</p>
            </div>

            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/dashboard/profile">
                <UserRound />
                Edit business profile
              </Link>
            </Button>
          </section>

          {/* coverage */}
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
            <h2 className="text-sm font-medium">Where you list</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cities in your portfolio, busiest first.
            </p>

            {cities.length > 0 ? (
              <ul className="scrollbar-hidden mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto overscroll-contain">
                {cities.map(([city, count]) => (
                  <li
                    key={city}
                    className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-3 py-2"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2 text-sm capitalize">
                      <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{city}</span>
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Cities appear here once you publish a listing.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
