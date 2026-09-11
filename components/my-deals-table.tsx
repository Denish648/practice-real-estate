"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils/format"
import type { Deal } from "@/lib/types/deal"
import Link from "next/link"

interface MyDealsTableProps {
  deals: Deal[]
}

export function MyDealsTable({ deals }: MyDealsTableProps) {
  const [filter, setFilter] = useState("all")

  const filteredDeals = deals.filter((deal) => {
    if (filter === "public") return deal.is_private === false
    if (filter === "private") return deal.is_private === true
    return true
  })

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Deals</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead>Deal</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Visibility</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => {
                const { id, title, city, price, is_private } = deal

                return (
                  <TableRow key={id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/broker/deals/${id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {title}
                      </Link>
                    </TableCell>
                    <TableCell>{city}</TableCell>
                    <TableCell>{formatPrice(price)}</TableCell>
                    <TableCell>
                      <Badge variant={is_private ? "secondary" : "default"}>
                        {is_private ? "Private" : "Public"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No deals Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
