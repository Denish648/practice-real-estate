"use client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function BrowseDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("deals")
      .select("*")
      .then(({ data }) => {
        if (data) setDeals(data);
      });
  }, []);

  return (
    <>
      <div className="flex flex-col gap-10 p-5">
        <h1 className="text-3xl font-semibold tracking-tight">My Deals</h1>

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
              {deals.map((deal) => {
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
    </>
  );
}
