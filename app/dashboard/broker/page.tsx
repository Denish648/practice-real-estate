"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BrokerDashboard() {
  const [deals, setDeals] = useState<any[]>([]);

  const allDeals = deals?.length ?? 0;

  const publicDeals = deals?.filter((deal) => !deal.is_private).length ?? 0;

  const privateDeals = deals?.filter((deal) => deal.is_private).length ?? 0;

  const totalPrice =
    deals?.reduce((total, deal) => {
      return total + Number(deal.price);
    }, 0) ?? 0;

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
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mx-10">
          <Card>
            <CardHeader>
              <CardDescription>Total Deals</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {allDeals}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Public Deals</CardDescription>
              <CardTitle className="text-2xl">{publicDeals}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Private Deals</CardDescription>
              <CardTitle className="text-2xl">{privateDeals}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-2xl">{totalPrice}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
