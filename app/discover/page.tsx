import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, MapPin } from "lucide-react"
import { getPublicDeals } from "@/lib/data/deals"
import { getDealCoverImages } from "@/lib/data/deal-images"
import { getUser } from "@/lib/data/user"
import { formatINRPrice } from "@/lib/utils/format"
import { applyFilters, isFiltered, parseFilters } from "@/lib/utils/deal-search"
import { HERO_IMAGE } from "@/lib/constants/site-images"
import { Container } from "@/components/landing/container"
import { HeroSearch } from "@/components/landing/hero-search"
import { PropertyCard } from "@/components/landing/property-card"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"

export const metadata = {
  title: "Discover properties",
  description: "Browse every public listing on the board. No account needed.",
}

/**
 * The public board. Anyone can reach it — `proxy.ts` lets `/discover` through
 * without a session, and RLS only ever hands an anonymous reader public deals.
 */
export default async function Discover({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseFilters(await searchParams)

  const { user } = await getUser()
  const { data: deals } = await getPublicDeals()

  const publicDeals = deals ?? []
  const cities = [...new Set(publicDeals.map((deal) => deal.city))].sort()
  const matchingDeals = applyFilters(publicDeals, filters)
  const filtered = isFiltered(filters)

  const { covers } = await getDealCoverImages(
    matchingDeals.map((deal) => deal.id),
  )

  const startingPrice = matchingDeals.length
    ? formatINRPrice(Math.min(...matchingDeals.map((deal) => deal.price)))
    : "—"

  return (
    <div className="relative bg-white text-neutral-900">
      <SiteHeader isSignedIn={!!user} variant="page" activeNav="discover" />

      {/* hero */}
      <section className="relative isolate overflow-hidden bg-neutral-900">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/25" />
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-black/45" />

        <Container className="relative pt-32 pb-12 sm:pt-40 lg:pb-16">
          <p className="text-[11px] font-medium tracking-wide text-white/70 uppercase">
            Public listings
          </p>
          <h1 className="mt-3 max-w-2xl text-[2rem] leading-[1.08] font-medium tracking-tight text-white sm:text-5xl sm:leading-[1.05]">
            Discover every property on the board.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">
            {publicDeals.length}{" "}
            {publicDeals.length === 1 ? "listing" : "listings"} across{" "}
            {cities.length} {cities.length === 1 ? "city" : "cities"}, starting
            at {startingPrice}. Open any of them without signing in.
          </p>

          <div className="mt-10">
            <HeroSearch
              cities={cities}
              filters={filters}
              basePath="/discover"
            />
          </div>
        </Container>
      </section>

      {/* cities */}
      {cities.length > 0 && (
        <section className="bg-[#eff2ec] py-8">
          <Container className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
              Locations
            </span>
            {cities.map((city) => {
              const count = publicDeals.filter(
                (deal) => deal.city === city,
              ).length

              return (
                <Link
                  key={city}
                  href={`/discover?city=${encodeURIComponent(city)}#properties`}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 capitalize transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  <MapPin className="size-3.5 text-neutral-400" />
                  {city}
                  <span className="text-neutral-400">{count}</span>
                </Link>
              )
            })}
          </Container>
        </section>
      )}

      {/* results */}
      <section id="properties" className="scroll-mt-20 py-16 md:py-20">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">
                {filtered ? "Search results" : "All listings"}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                {matchingDeals.length}{" "}
                {matchingDeals.length === 1 ? "property" : "properties"}{" "}
                {filtered ? "match your search." : "published by brokers."}
              </p>
            </div>

            {filtered && (
              <Link
                href="/discover#properties"
                className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>

          {matchingDeals.length > 0 ? (
            <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {matchingDeals.map((deal) => (
                <PropertyCard
                  key={deal.id}
                  deal={deal}
                  imageUrl={covers[deal.id]}
                  brokerName={deal.broker?.name}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 py-16 text-center">
              <Building2 className="size-6 text-neutral-400" />
              <p className="font-medium">
                {publicDeals.length === 0
                  ? "No public listings yet"
                  : "No listings match your search"}
              </p>
              <p className="max-w-sm text-sm text-neutral-500">
                {publicDeals.length === 0
                  ? "Properties show up here as soon as a broker publishes one."
                  : "Try a wider price range or a different location."}
              </p>
              {filtered && (
                <Link
                  href="/discover#properties"
                  className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-900 underline underline-offset-4"
                >
                  Clear filters
                  <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          )}
        </Container>
      </section>

      <SiteFooter />
    </div>
  )
}
