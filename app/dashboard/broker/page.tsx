import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getDeals } from "@/lib/data/deals"
import { getProfile } from "@/lib/data/profile"
import { getUser } from "@/lib/data/user"
import { formatPrice } from "@/lib/utils/format"

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

  const totalDeals = deals.length
  const publicDeals = deals.filter((deal) => !deal.is_private).length
  const privateDeals = deals.filter((deal) => deal.is_private).length

  const totalPrice = deals.reduce((total, deal) => {
    return total + deal.price
  }, 0)

  return (
    <>
      <div className="flex flex-col gap-10 p-5">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        {/* user profile  */}
        <Card className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {profile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.company}</CardDescription>
              </div>

              <Badge className="ml-auto">{profile.role}</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <Separator className="mb-4" />

            <div className="text-sm">
              <p className="text-muted-foreground">Phone</p>
              <p>{profile.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* total deals */}
          <Card>
            <CardHeader>
              <CardDescription>Total Deals</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {totalDeals}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* public deals */}
          <Card>
            <CardHeader>
              <CardDescription>Public Deals</CardDescription>
              <CardTitle className="text-2xl">{publicDeals}</CardTitle>
            </CardHeader>
          </Card>

          {/* private deals */}
          <Card>
            <CardHeader>
              <CardDescription>Private Deals</CardDescription>
              <CardTitle className="text-2xl">{privateDeals}</CardTitle>
            </CardHeader>
          </Card>

          {/* total value */}
          <Card>
            <CardHeader>
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-2xl">
                {formatPrice(totalPrice)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  )
}
