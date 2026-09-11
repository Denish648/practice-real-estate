"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Briefcase, ImageOff, Lock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DealSearchField } from "@/components/deal-search-field"
import { formatListedDate } from "@/lib/utils/deal-feed"
import { formatINRPrice } from "@/lib/utils/format"
import { dealPath } from "@/lib/utils/slug"
import type { Deal } from "@/lib/types/deal"

interface MyDealsTableProps {
  deals: Deal[]
  covers: Record<string, string>
  brokerName: string
}

/**
 * Management view of the broker's listings — a table, deliberately, because
 * this page is for scanning and editing rather than browsing. The buyer-facing
 * card feed lives on the dashboard and Browse Deals.
 */
export function MyDealsTable({ deals, covers, brokerName }: MyDealsTableProps) {
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")

  const filteredDeals = useMemo(() => {
    const search = query.trim().toLowerCase()

    return deals.filter((deal) => {
      if (filter === "public" && deal.is_private) return false
      if (filter === "private" && !deal.is_private) return false
      if (!search) return true

      return (
        deal.title.toLowerCase().includes(search) ||
        deal.city.toLowerCase().includes(search)
      )
    })
  }, [deals, filter, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <DealSearchField
          value={query}
          onChange={setQuery}
          placeholder="Search your listings by title or city"
          className="flex-1"
        />

        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="h-11 w-full rounded-full sm:w-40">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Deals</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredDeals.length} of {deals.length}{" "}
        {deals.length === 1 ? "listing" : "listings"}.
      </p>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/70 hover:bg-secondary/70">
                <TableHead className="min-w-64">Listing</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Listed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => {
                  const { id, title, city, price, is_private } = deal
                  const cover = covers[id]

                  return (
                    <TableRow key={id} className="group/row">
                      <TableCell>
                        <Link
                          href={`/dashboard/broker/deals/${id}`}
                          className="flex items-center gap-3"
                        >
                          <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                            {cover ? (
                              <Image
                                src={cover}
                                alt={title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center text-muted-foreground">
                                <ImageOff className="size-4" />
                              </span>
                            )}
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate font-medium underline-offset-4 group-hover/row:underline">
                              {title}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground capitalize">
                              {city}
                            </span>
                          </span>
                        </Link>
                      </TableCell>

                      {/* compact unit: the column is narrow on tablet */}
                      <TableCell className="text-right whitespace-nowrap tabular-nums">
                        {formatINRPrice(price, { compact: true })}
                      </TableCell>

                      <TableCell>
                        <Badge variant={is_private ? "secondary" : "default"}>
                          {is_private && <Lock />}
                          {is_private ? "Private" : "Public"}
                        </Badge>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatListedDate(deal.created_at)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {!is_private && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={dealPath(brokerName, title)}
                                title="Open the public listing page"
                              >
                                Public page
                                <ArrowUpRight />
                              </Link>
                            </Button>
                          )}

                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/broker/deals/${id}`}>
                              Manage
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <Briefcase className="size-6 text-muted-foreground" />
                      <p className="font-medium">
                        {deals.length === 0
                          ? "No deals yet"
                          : "No deals match this filter"}
                      </p>
                      <p className="max-w-xs text-sm text-muted-foreground">
                        {deals.length === 0
                          ? "Your listings, public and private, live here once you create them."
                          : "Try another visibility filter or a different keyword."}
                      </p>
                      {deals.length === 0 && (
                        <Button size="sm" className="mt-1" asChild>
                          <Link href="/dashboard/broker/create-deal">
                            Create your first deal
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
