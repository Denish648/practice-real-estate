import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getDealImagesWithSignedUrls } from "@/lib/data/deal-images"
import { getDealById } from "@/lib/data/deals"
import { getUser } from "@/lib/data/user"
import { formatPrice, getInitials } from "@/lib/utils/format"
import { ArrowLeft, Building2, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BuyerDealDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: deal, error } = await getDealById(id)

  if (error || !deal || deal.is_private) {
    notFound()
  }

  const broker = deal.broker

  const { images } = await getDealImagesWithSignedUrls(
    deal.id,
    deal.broker_id,
    deal.is_private,
  )

  return (
    <div className="flex flex-col gap-8 p-5 max-w-3xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/dashboard/buyer/browse-deals">
            <ArrowLeft className="size-4" /> Back to Browse Deals
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {/* deal images */}
        {deal.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-video rounded-lg overflow-hidden border"
              >
                <Image
                  src={img.signedUrl}
                  alt={deal.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            ))}
          </div>
        )}

        {/* Deal Header Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{deal.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-sm">
              <MapPin className="size-4" /> {deal.city}
            </CardDescription>
            <CardAction>
              <Badge variant="default">Public Deal</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatPrice(deal.price)}
            </div>
          </CardContent>
        </Card>

        {/* Broker Information Card */}
        {broker && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={broker.avatar_url ?? undefined}
                    alt={broker.name}
                  />
                  <AvatarFallback>{getInitials(broker.name)}</AvatarFallback>
                </Avatar>

                <div>
                  <CardTitle>{broker.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building2 className="size-3.5" /> {broker.company}
                  </CardDescription>
                </div>

                <Badge variant="outline" className="ml-auto">
                  Broker
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <Separator className="mb-4" />
              <div className="text-sm">
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{broker.phone || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
