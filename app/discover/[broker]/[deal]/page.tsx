import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ImageOff,
  MapPin,
  Phone,
} from "lucide-react"
import { getDealById, getPublicDealBySlug } from "@/lib/data/deals"
import { getDealImagesWithSignedUrls } from "@/lib/data/deal-images"
import { getUser } from "@/lib/data/user"
import { formatINRPrice, getInitials } from "@/lib/utils/format"
import { brokerSlug, dealPath } from "@/lib/utils/slug"
import { HERO_IMAGE } from "@/lib/constants/site-images"
import { Container } from "@/components/landing/container"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"

type Params = Promise<{ broker: string; deal: string }>

export async function generateMetadata({ params }: { params: Params }) {
  const { broker, deal } = await params
  const { data } = await getPublicDealBySlug(broker, deal)

  if (!data) return { title: "Listing not found" }

  return {
    title: `${data.title} — ${data.city}`,
    description: `${data.title} in ${data.city}, listed at ${formatINRPrice(data.price)}.`,
  }
}

/**
 * Public deal detail at `/discover/{broker-name}/{deal-title}`.
 *
 * No session required: RLS only exposes `is_private = false` rows to `anon`, so
 * a private deal simply does not resolve and this renders `notFound()`.
 */
export default async function PublicDealDetail({ params }: { params: Params }) {
  const { broker: brokerParam, deal: dealParam } = await params

  const { data: match } = await getPublicDealBySlug(brokerParam, dealParam)
  if (!match) notFound()

  // keep one canonical URL per listing when the broker segment is stale
  const canonicalBroker = match.broker?.name
    ? brokerSlug(match.broker.name)
    : null
  if (canonicalBroker && canonicalBroker !== brokerParam) {
    redirect(dealPath(match.broker?.name, match.title))
  }

  const { user } = await getUser()

  // the slug lookup omits the phone number and the photo rows
  const { data: deal } = await getDealById(match.id)
  if (!deal || deal.is_private) notFound()

  const { images } = await getDealImagesWithSignedUrls(
    deal.id,
    deal.broker_id,
    deal.is_private,
  )

  const [coverImage, ...otherImages] = images
  const contact = deal.broker

  return (
    <div className="relative bg-white text-neutral-900">
      <SiteHeader isSignedIn={!!user} variant="page" activeNav="discover" />

      {/* title band — dark so the fixed header stays readable at the top */}
      <section className="relative isolate overflow-hidden bg-neutral-900">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/35" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/50" />

        <Container className="relative pt-30 pb-12 sm:pt-36">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-xs text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back to all listings
          </Link>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="max-w-2xl text-[1.9rem] leading-[1.1] font-medium tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                {deal.title}
              </h1>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/75 capitalize">
                <MapPin className="size-4" />
                {deal.city}
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/20 backdrop-blur-sm">
              <p className="text-[11px] font-medium tracking-wide text-white/60 uppercase">
                Asking price
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-white sm:text-3xl">
                {formatINRPrice(deal.price)}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* photos */}
      <section className="py-12 md:py-16">
        <Container>
          {coverImage ? (
            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100 lg:aspect-auto lg:min-h-110">
                <Image
                  src={coverImage.signedUrl}
                  alt={`${deal.title} — photo 1`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 700px"
                />
              </div>

              {otherImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                  {otherImages.slice(0, 2).map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100 lg:aspect-auto lg:min-h-53"
                    >
                      <Image
                        src={image.signedUrl}
                        alt={`${deal.title} — photo ${index + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 420px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex aspect-21/9 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 text-neutral-400">
              <ImageOff className="size-6" />
              <p className="text-sm">No photos for this listing</p>
            </div>
          )}

          {otherImages.length > 2 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {otherImages.slice(2).map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100"
                >
                  <Image
                    src={image.signedUrl}
                    alt={`${deal.title} — photo ${index + 4}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 280px"
                  />
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* broker contact */}
      <section className="bg-[#eff2ec] py-16 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="max-w-md text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">
                Talk to the broker behind this listing
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                Viewings, documentation and the asking price are all handled by
                the broker who published this property. The board only
                advertises it.
              </p>
            </div>

            {contact ? (
              <div className="rounded-2xl bg-white p-6 ring-1 ring-neutral-200">
                <div className="flex items-center gap-4">
                  <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-sm font-medium text-neutral-600">
                    {contact.avatar_url ? (
                      <Image
                        src={contact.avatar_url}
                        alt={contact.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      getInitials(contact.name)
                    )}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-medium">
                      {contact.name}
                    </p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 truncate text-sm text-neutral-500">
                      <Building2 className="size-3.5" />
                      {contact.company}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-neutral-200 pt-5">
                  {contact.phone ? (
                    <a
                      href={`tel:${contact.phone}`}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                    >
                      <Phone className="size-4" />
                      {contact.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-neutral-500">
                      This broker has not published a phone number.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-6 text-sm text-neutral-500 ring-1 ring-neutral-200">
                Broker details are unavailable for this listing.
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* closing */}
      <section className="py-16 md:py-20">
        <Container className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-neutral-500">
            Keep looking — every public listing on the board is open to anyone,
            no account required.
          </p>
          <Link
            href="/discover"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Browse more properties
            <ArrowRight className="size-4" />
          </Link>
        </Container>
      </section>

      <SiteFooter />
    </div>
  )
}
