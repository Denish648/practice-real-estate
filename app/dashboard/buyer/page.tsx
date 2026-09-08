import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDeals } from "@/lib/data/deals";
import { getProfile } from "@/lib/data/profile";

export default async function BuyerDashboard() {
  const { profileData: profile, error: profileError } = await getProfile();
  if (profileError) throw profileError;
  if (!profile) throw new Error("Profile not found");

  const { data: deals, error: dealsError } = await getDeals();
  if (dealsError) throw dealsError;
  if (!deals) throw new Error("Deals not found");

  const totalPrice = deals.reduce((total, deal) => {
    return total + deal.price;
  }, 0);

  return (
    <>
      <div className="flex flex-col gap-10 p-5">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        {/* profile */}
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
          <Card>
            <CardHeader>
              <CardDescription>Total Deals (Only Public Deals)</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {deals.length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Price</CardDescription>
              <CardTitle className="text-2xl">{totalPrice}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
