"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "cn"
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react"
import type { Deal } from "@/lib/types/deal"

function SpotlightImage({
  imageUrl,
  alt,
  className,
  sizes,
}: {
  imageUrl?: string
  alt: string
  className: string
  sizes: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-neutral-100",
        className,
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-neutral-400">
          <ImageOff className="size-6" />
        </div>
      )}
    </div>
  )
}

export function Spotlight({
  featured,
  covers,
  startingPrice,
}: {
  featured: Deal[]
  covers: Record<string, string>
  startingPrice: string
}) {
  const [index, setIndex] = useState(0)

  const current = featured[index]
  const next = featured[(index + 1) % Math.max(featured.length, 1)]
  const canCycle = featured.length > 1

  function move(step: number) {
    setIndex((prev) => (prev + step + featured.length) % featured.length)
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr_1fr]">
        <SpotlightImage
          imageUrl={current && covers[current.id]}
          alt={current ? current.title : "Featured property"}
          className="aspect-4/3 lg:aspect-auto lg:min-h-85"
          sizes="(max-width: 1024px) 100vw, 460px"
        />

        <div className="flex flex-col justify-between rounded-2xl bg-[#f1f3ee] p-5">
          <div>
            <h3 className="text-lg font-medium text-neutral-900">
              Big things can happen in small spaces
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600">
              Every listing carries its own photos, price and location, so you
              can judge a property before you ever pick up the phone.
            </p>
          </div>

          <Link
            href="#properties"
            className="mt-6 inline-flex w-fit rounded-full bg-white px-4 py-2 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            Details
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <SpotlightImage
            imageUrl={next && covers[next.id]}
            alt={next ? next.title : "Featured property"}
            className="aspect-16/10 lg:aspect-auto lg:flex-1"
            sizes="(max-width: 1024px) 100vw, 340px"
          />

          <div className="rounded-2xl bg-[#f1f3ee] p-4">
            <p className="text-sm font-medium text-neutral-900">
              Pricing starts at {startingPrice}
            </p>
            <Link
              href="#properties"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Explore Properties
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-6">
        <p className="max-w-md text-xs leading-relaxed text-neutral-500">
          {current
            ? `Now showing ${current.title} in ${current.city}.`
            : "Listings published by brokers show up here as soon as they go public."}
        </p>

        {canCycle && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous property"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next property"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-800"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
