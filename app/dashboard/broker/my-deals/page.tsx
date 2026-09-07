"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MyDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("deals")
      .select("*")
      .then(({ data }) => {
        if (data) setDeals(data);
      });
  }, []);

  const filteredDeals = deals.filter((deal) => {
    if (filter === "public") return deal.is_private === false;
    if (filter === "private") return deal.is_private === true;
    return true;
  });

  return (
    <div className="flex flex-col gap-10 p-5">
      <h1 className="text-3xl font-semibold tracking-tight">My Deals</h1>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={filter}
          onValueChange={(value) => {
            setFilter(value);
          }}
        >
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
            {filteredDeals.map((deal) => {
              const { id, title, city, price, is_private } = deal;

              return (
                <TableRow key={deal.id}>
                  <TableCell>{title}</TableCell>

                  <TableCell>{city}</TableCell>

                  <TableCell>
                    ₹{Number(price).toLocaleString("en-IN")}
                  </TableCell>

                  <TableCell>
                    <Badge variant={is_private ? "secondary" : "default"}>
                      {is_private ? "Private" : "Public"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
