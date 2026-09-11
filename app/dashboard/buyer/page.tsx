import Link from "next/link"
import { Building2, IndianRupee, MapPin, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { BuyerBoard, type FeedBroker } from "@/components/buyer-board"
import { getPublicDeals } from "@/lib/data/deals"
import { getDealCoverImages } from "@/lib/data/deal-images"
import { getBrokers, getProfile } from "@/lib/data/profile"
import { toFeedDeals } from "@/lib/utils/deal-feed"
import { formatINRPrice, getInitials } from "@/lib/utils/format"

export default async function BuyerDashboard() {
  const { profileData: profile, error: profileError } = await getProfile()
  if (profileError) throw profileError
  if (!profile) throw new Error("Profile not found")

  const { data: deals, error: dealsError } = await getPublicDeals()
  if (dealsError) throw dealsError
  if (!deals) throw new Error("Deals not found")

  const { brokers, error: brokersError } = await getBrokers()
  if (brokersError) throw brokersError

  const { covers } = await getDealCoverImages(deals.map((deal) => deal.id))

  const totalPrice = deals.reduce((total, deal) => total + deal.price, 0)
  const cities = new Set(deals.map((deal) => deal.city)).size

  const feedDeals = toFeedDeals(deals, covers)

  const feedBrokers: FeedBroker[] = (brokers ?? []).map((broker) => ({
    ...broker,
    dealCount: deals.filter((deal) => deal.broker_id === broker.id).length,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Listings currently available to you, and the brokers behind them.
          </p>
        </div>

        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 rounded-full bg-secondary py-1.5 pr-4 pl-1.5 transition-colors hover:bg-accent"
        >
          <Avatar className="size-8">
            <AvatarImage
              src={profile.avatar_url ?? undefined}
              alt={profile.name}
            />
            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{profile.name}</span>
          <Badge variant="outline" className="capitalize">
            {profile.role}
          </Badge>
        </Link>
      </div>

      {/* stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Available deals"
          value={deals.length}
          icon={<Building2 />}
        />
        <StatCard label="Cities" value={cities} icon={<MapPin />} />
        <StatCard
          label="Brokers listing"
          value={(brokers ?? []).length}
          icon={<Users />}
        />
        <StatCard
          label="Total value"
          value={formatINRPrice(totalPrice)}
          icon={<IndianRupee />}
        />
      </div>

      <BuyerBoard deals={feedDeals} brokers={feedBrokers} />
    </div>
  )
}
