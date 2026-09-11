"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "cn"
import { ArrowRight, ChevronDown } from "lucide-react"
import type { SearchFilters } from "@/lib/utils/deal-search"
import { formatINRPrice } from "@/lib/utils/format"

/** Upper bounds offered in the price dropdown, in rupees. */
const priceCeilings = [5000000, 10000000, 50000000]

const priceOptions = [
  { value: "any", label: "Any price" },
  ...priceCeilings.map((ceiling) => ({
    value: String(ceiling),
    label: `Up to ${formatINRPrice(ceiling)}`,
  })),
]

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

function buildSearchHref(filters: SearchFilters, basePath: string) {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.city !== "any") params.set("city", filters.city)
  if (filters.max !== "any") params.set("max", filters.max)
  if (filters.sort !== "newest") params.set("sort", filters.sort)

  const query = params.toString()
  return query ? `${basePath}?${query}#properties` : `${basePath}#properties`
}

/** `basePath` is where a search lands: `/` on the landing page, `/discover` on the public board. */
export function HeroSearch({
  cities,
  filters,
  basePath = "/",
}: {
  cities: string[]
  filters: SearchFilters
  basePath?: string
}) {
  const router = useRouter()
  const [draft, setDraft] = useState(filters)

  function search(next: SearchFilters) {
    setDraft(next)
    router.push(buildSearchHref(next, basePath))
  }

  const cityOptions = [
    { value: "any", label: "All locations" },
    ...cities.map((city) => ({ value: city, label: city })),
  ]

  return (
    <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-5">
      <p className="text-sm font-medium text-neutral-900">
        Find the best place
      </p>

      <form
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-neutral-200"
        onSubmit={(e) => {
          e.preventDefault()
          search(draft)
        }}
      >
        <div className="lg:pr-5">
          <FieldLabel htmlFor="q">Looking for</FieldLabel>
          <input
            id="q"
            name="q"
            value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
            placeholder="Enter a title"
            className="mt-1.5 h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus-visible:border-neutral-400"
          />
        </div>

        <SelectField
          id="max"
          label="Price"
          className="lg:px-5"
          value={draft.max}
          options={priceOptions}
          onChange={(value) => setDraft({ ...draft, max: value })}
        />

        <SelectField
          id="city"
          label="Locations"
          className="lg:px-5"
          value={draft.city}
          options={cityOptions}
          onChange={(value) => setDraft({ ...draft, city: value })}
        />

        <SelectField
          id="sort"
          label="Sort by"
          className="lg:pl-5"
          value={draft.sort}
          options={sortOptions}
          onChange={(value) => setDraft({ ...draft, sort: value })}
        />

        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4 sm:col-span-2 lg:col-span-4 lg:mt-4">
          <span className="text-xs text-neutral-500">Filter:</span>

          <Chip
            active={draft.city === "any"}
            onClick={() => search({ ...draft, city: "any" })}
          >
            All
          </Chip>
          {cities.slice(0, 4).map((city) => (
            <Chip
              key={city}
              active={draft.city === city}
              onClick={() => search({ ...draft, city })}
            >
              <span className="capitalize">{city}</span>
            </Chip>
          ))}

          <button
            type="submit"
            className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            Search Properties
            <ArrowRight className="size-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase"
    >
      {children}
    </label>
  )
}

function SelectField({
  id,
  label,
  className,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  className?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative mt-1.5">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-white pr-8 pl-3 text-sm text-neutral-900 capitalize outline-none focus-visible:border-neutral-400"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-neutral-400" />
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 text-neutral-600 hover:border-neutral-400",
      )}
    >
      {children}
    </button>
  )
}
