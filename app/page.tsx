import Image from "next/image"
import Link from "next/link"
import { cn } from "cn"
import { ArrowRight, Building2, MapPin } from "lucide-react"
import { getPublicDeals } from "@/lib/data/deals"
import { getDealCoverImages } from "@/lib/data/deal-images"
import { getUser } from "@/lib/data/user"
import { formatINRPrice } from "@/lib/utils/format"
import { applyFilters, isFiltered, parseFilters } from "@/lib/utils/deal-search"
import { CONTACT_IMAGE, HERO_IMAGE } from "@/lib/constants/site-images"
import { Container } from "@/components/landing/container"
import { FaqSection } from "@/components/landing/faq-section"
import { HeroSearch } from "@/components/landing/hero-search"
import { PropertyCard } from "@/components/landing/property-card"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Spotlight } from "@/components/landing/spotlight"
import { Testimonials } from "@/components/landing/testimonials"

const PROPERTIES_SHOWN = 6

export default async function Home({ searchParams }: PageProps<"/">) {
  const filters = parseFilters(await searchParams)

  const { user } = await getUser()
  const { data: deals } = await getPublicDeals()

  const publicDeals = deals ?? []

  const cities = [...new Set(publicDeals.map((deal) => deal.city))].sort()
  const matchingDeals = applyFilters(publicDeals, filters)
  const properties = matchingDeals.slice(0, PROPERTIES_SHOWN)
  const featured = publicDeals.slice(0, 3)

  const coverIds = [
    ...new Set([...featured, ...properties].map((deal) => deal.id)),
  ]
  const { covers } = await getDealCoverImages(coverIds)

  // deal photos still drive the listing content; the hero and closing sections
  // use fixed artwork so the page does not change shape with the newest upload
  const featuredCover = featured[0] && covers[featured[0].id]

  const startingPrice = publicDeals.length
    ? formatINRPrice(Math.min(...publicDeals.map((deal) => deal.price)))
    : "—"

  const brokerCount = new Set(publicDeals.map((deal) => deal.broker_id)).size

  const stats = [
    { value: `${publicDeals.length}`, label: "Properties listed" },
    { value: `${cities.length}`, label: "Cities covered" },
    { value: `${brokerCount}`, label: "Brokers listing" },
    { value: startingPrice, label: "Starting from" },
  ]

  const filtered = isFiltered(filters)

  return (
    <div className="relative bg-white text-neutral-900">
      <SiteHeader isSignedIn={!!user} />

      {/* hero */}
      <section
        id="home"
        className="relative isolate overflow-hidden bg-neutral-900 scroll-mt-20"
      >
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* two light scrims instead of one flat wash: the copy stays readable
            on the left, the header and search keep contrast, and the photo is
            never dimmed to mud */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-black/45" />

        <Container className="relative pt-36 pb-12 sm:pt-44 lg:pt-56 lg:pb-16">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <h1 className="text-[2rem] leading-[1.08] font-medium tracking-tight text-white sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]">
              Build Your Future, One Property at a Time.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              Every listing here is published by the broker who owns it, with
              its own photos, asking price and location. Search the board, then
              talk to the person behind the property.
            </p>
          </div>

          <div className="mt-12">
            <HeroSearch cities={cities} filters={filters} />
          </div>
        </Container>
      </section>

      {/* about */}
      <section id="about" className="scroll-mt-20 py-16 md:py-24">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-xl text-3xl leading-[1.12] font-medium tracking-tight sm:text-4xl lg:text-[2.6rem]">
              Your primary home might begin to feel left out.
            </h2>

            <Link
              href="#properties"
              className="group flex max-w-xs items-center gap-3"
            >
              <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                {featuredCover && (
                  <Image
                    src={featuredCover}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </span>
              <span className="text-xs leading-relaxed text-neutral-500">
                Each listing offers unique features, exceptional quality and
                prime locations.
              </span>
              <ArrowRight className="size-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-10">
            <Spotlight
              featured={featured}
              covers={covers}
              startingPrice={startingPrice}
            />
          </div>
        </Container>
      </section>

      {/* stats */}
      <section className="pb-16 md:pb-20">
        <Container>
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-4 md:divide-x md:divide-neutral-200">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn("min-w-0", index === 0 ? "md:pr-8" : "md:px-8")}
              >
                <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* locations */}
      <section className="bg-[#eff2ec] py-16 md:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex min-h-64 flex-col rounded-2xl bg-white p-6 ring-1 ring-neutral-200">
              <p className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                Available locations
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                Every city with a public listing right now, and how many
                properties sit in each.
              </p>

              {cities.length > 0 ? (
                <div className="mt-6 flex flex-wrap content-start gap-2">
                  {cities.map((city) => {
                    const count = publicDeals.filter(
                      (deal) => deal.city === city,
                    ).length

                    return (
                      <Link
                        key={city}
                        href={`/?city=${encodeURIComponent(city)}#properties`}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 capitalize transition-colors hover:border-neutral-900 hover:text-neutral-900"
                      >
                        <MapPin className="size-3.5 text-neutral-400" />
                        {city}
                        <span className="text-neutral-400">{count}</span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-neutral-500">
                  Locations appear here once brokers publish their first public
                  listing.
                </p>
              )}
            </div>

            <div>
              <h2 className="max-w-md text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">
                Discover Properties with the Best Value
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
                Filter the board by city and asking price to see what your
                budget actually reaches, without wading through listings that
                were never a fit.
              </p>
              <Link
                href="/discover"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Find Nearest Properties
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* properties */}
      <section id="properties" className="scroll-mt-20 py-16 md:py-24">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="max-w-md text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">
                Explore our premier houses
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
                {filtered
                  ? `${matchingDeals.length} ${matchingDeals.length === 1 ? "listing matches" : "listings match"} your search.`
                  : "Each listing offers unique features, exceptional quality and prime locations, ensuring an exclusive living experience."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {filtered && (
                <Link
                  href="/#properties"
                  className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
                >
                  Clear filters
                </Link>
              )}
              <Link
                href="/discover"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                See All Properties
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {properties.length > 0 ? (
            <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((deal) => (
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
                  href="/#properties"
                  className="mt-1 text-sm text-neutral-900 underline underline-offset-4"
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}
        </Container>
      </section>

      <FaqSection imageUrl={featuredCover || undefined} />

      {/* reviews */}
      <section id="reviews" className="scroll-mt-20 pb-16 md:pb-24">
        <Container>
          <Testimonials />
        </Container>
      </section>

      {/* closing call to action */}
      <section className="relative isolate overflow-hidden bg-neutral-900 py-20 md:py-28">
        <Image
          src={CONTACT_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <Container className="relative text-center">
          <h2 className="mx-auto max-w-2xl text-3xl leading-[1.15] font-medium tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Ready to Make Your Dream Property a Reality?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80">
            Browse every public listing and open any of them without an account.
            Sign up when you are ready to manage listings of your own.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              Browse Listings
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {user ? "Go to Dashboard" : "Create an Account"}
            </Link>
          </div>
        </Container>
      </section>

      <SiteFooter />
    </div>
  )
}
