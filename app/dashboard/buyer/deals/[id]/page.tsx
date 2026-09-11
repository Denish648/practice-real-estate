import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getDealImagesWithSignedUrls } from "@/lib/data/deal-images"
import { getDealById } from "@/lib/data/deals"
import { getUser } from "@/lib/data/user"
import { formatINRPrice, getInitials } from "@/lib/utils/format"
import { ArrowLeft, Building2, ImageOff, MapPin, Phone } from "lucide-react"
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

  const [coverImage, ...otherImages] = images

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/buyer/browse-deals">
            <ArrowLeft />
            Back to Browse Deals
          </Link>
        </Button>
      </div>

      {/* deal header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
            {deal.title}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {deal.city}
          </p>
        </div>

        <p className="text-2xl font-semibold tabular-nums">
          {formatINRPrice(deal.price)}
        </p>
      </div>

      {/* deal images */}
      {coverImage ? (
        <div className="flex flex-col gap-3">
          <div className="relative aspect-video overflow-hidden rounded-xl border">
            <Image
              src={coverImage.signedUrl}
              alt={`${deal.title} — photo 1`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>

          {otherImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {otherImages.map((img, index) => (
                <div
                  key={img.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border"
                >
                  <Image
                    src={img.signedUrl}
                    alt={`${deal.title} — photo ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 250px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
          <ImageOff className="size-6" />
          <p className="text-sm">No photos for this listing</p>
        </div>
      )}

      {/* broker contact */}
      {broker && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarImage
                  src={broker.avatar_url ?? undefined}
                  alt={broker.name}
                />
                <AvatarFallback>{getInitials(broker.name)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <CardTitle className="truncate">{broker.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 truncate">
                  <Building2 className="size-3.5" />
                  {broker.company}
                </CardDescription>
              </div>

              <Badge variant="outline" className="ml-auto">
                Broker
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Separator />

            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              {broker.phone ? (
                <a
                  href={`tel:${broker.phone}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {broker.phone}
                </a>
              ) : (
                <span className="text-muted-foreground">
                  Phone not provided
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
