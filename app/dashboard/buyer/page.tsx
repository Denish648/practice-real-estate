"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function BuyerDashboard() {
  const [loading, setLoading] = useState(true);

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

  const totalPrice =
    deals?.reduce((total, deal) => {
      return total + Number(deal.price);
    }, 0) ?? 0;

  return (
    <>
      <div className="flex flex-col gap-10 p-5">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mx-10">
          <Card>
            <CardHeader>
              <CardDescription>Total Deals (Only Public Deals)</CardDescription>
              <CardTitle className="text-2xl font-semibold">
                {deals?.length ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Price</CardDescription>
              <CardTitle className="text-2xl">{totalPrice}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
