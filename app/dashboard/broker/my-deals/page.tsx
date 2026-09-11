import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { MyDealsTable } from "@/components/my-deals-table"
import { Button } from "@/components/ui/button"
import { getDeals } from "@/lib/data/deals"
import { getDealCoverImages } from "@/lib/data/deal-images"
import { getProfile } from "@/lib/data/profile"
import { getUser } from "@/lib/data/user"
import { formatINRPrice } from "@/lib/utils/format"

export default async function MyDeals() {
  const { user, error: userError } = await getUser()
  if (userError) throw userError
  if (!user) throw new Error("Unauthorized")

  const { profileData: profile, error: profileError } = await getProfile()
  if (profileError) throw profileError
  if (!profile) throw new Error("Profile not found")

  const { data: deals, error: dealsError } = await getDeals(user.id)
  if (dealsError) throw dealsError

  const myDeals = deals ?? []
  const { covers } = await getDealCoverImages(myDeals.map((deal) => deal.id))

  const publicCount = myDeals.filter((deal) => !deal.is_private).length
  const totalPrice = myDeals.reduce((total, deal) => total + deal.price, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            My Deals
          </h1>
          <p className="text-sm text-muted-foreground">
            {myDeals.length} {myDeals.length === 1 ? "listing" : "listings"} ·{" "}
            {publicCount} public · {formatINRPrice(totalPrice)} in total value.
            Private deals stay invisible to buyers.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/broker/create-deal">
            <PlusCircle />
            Create deal
          </Link>
        </Button>
      </div>

      <MyDealsTable deals={myDeals} covers={covers} brokerName={profile.name} />
    </div>
  )
}
