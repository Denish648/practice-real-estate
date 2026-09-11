"use client"

import { useState } from "react"
import { cn } from "cn"
import { ArrowLeft, ArrowRight, Quote } from "lucide-react"
import { getInitials } from "@/lib/utils/format"

const testimonials = [
  {
    quote:
      "Working with this team was a pleasure. They understood our vision and helped us find a property that exceeded our expectations. We couldn't have done it without them!",
    name: "Sajibur Rahman",
    role: "Buyer, Dhaka",
  },
  {
    quote:
      "Listing our portfolio here took an afternoon. Buyers now reach us with the property already in mind, which has cut out most of the back and forth.",
    name: "Meera Nair",
    role: "Broker, Ahmedabad",
  },
  {
    quote:
      "Being able to compare asking prices across cities in one place made the shortlist obvious. The broker details were right there when we were ready to call.",
    name: "Daniel Okafor",
    role: "Buyer, Pune",
  },
]

export function Testimonials() {
  const [index, setIndex] = useState(0)
  const active = testimonials[index]

  function move(step: number) {
    setIndex(
      (prev) => (prev + step + testimonials.length) % testimonials.length,
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-md text-3xl leading-[1.15] font-medium tracking-tight text-neutral-900 sm:text-4xl">
          What our clients say about us
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex">
            {testimonials.map((item) => (
              <span
                key={item.name}
                className="-ml-2 flex size-8 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-700 ring-2 ring-white first:ml-0"
              >
                {getInitials(item.name)}
              </span>
            ))}
          </div>
          <p className="max-w-40 text-xs leading-snug text-neutral-500">
            Trusted by buyers and brokers
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous testimonial"
          className="hidden size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 md:flex"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="grid flex-1 gap-6 rounded-2xl bg-[#f5f7f3] p-6 sm:grid-cols-[180px_1fr] sm:items-center lg:p-8">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-neutral-200 text-2xl font-medium text-neutral-600">
            {getInitials(active.name)}
          </div>

          <div>
            <Quote className="size-7 text-neutral-300" />
            <p className="mt-3 text-lg leading-relaxed text-neutral-800">
              {active.quote}
            </p>
            <p className="mt-6 text-sm font-medium text-neutral-900">
              {active.name}
            </p>
            <p className="text-xs text-neutral-500">{active.role}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next testimonial"
          className="hidden size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 md:flex"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {testimonials.map((item, itemIndex) => (
          <button
            key={item.name}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-label={`Show testimonial ${itemIndex + 1}`}
            aria-current={itemIndex === index}
            className={cn(
              "h-1.5 cursor-pointer rounded-full transition-all",
              itemIndex === index
                ? "w-6 bg-green-600"
                : "w-1.5 bg-neutral-300 hover:bg-neutral-400",
            )}
          />
        ))}
      </div>
    </div>
  )
}
