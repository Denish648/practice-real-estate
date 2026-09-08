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
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/format";

export default function MyDeals() {
  const [deals, setDeals] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDeals() {
      const supabase = createClient();
      setLoading(true);
      const {
        data: { user: user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("unauthorized");
        return;
      }
      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("*")
        .eq("broker_id", user.id);

      setLoading(false);

      if (dealsError) {
        toast.error("error fetching deals");
        return;
      }

      setDeals(dealsData ?? []);
    }
    getDeals();
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
            {deals.length > 0 ? (
              filteredDeals.map((deal) => {
                const { id, title, city, price, is_private } = deal;

                return (
                  <TableRow key={id}>
                    <TableCell>{title}</TableCell>

                    <TableCell>{city}</TableCell>

                    <TableCell>{formatPrice(price)}</TableCell>

                    <TableCell>
                      <Badge variant={is_private ? "secondary" : "default"}>
                        {is_private ? "Private" : "Public"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {loading ? "loading..." : "No records"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
