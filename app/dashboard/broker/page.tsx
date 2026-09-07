"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function BrokerDashboard() {
  const [loading, setLoading] = useState(true);

  const [deals, setDeals] = useState<any[]>([]);

  const allDeals = deals?.length ?? 0;

  const publicDeals = deals?.filter((deal) => !deal.is_private).length ?? 0;

  const privateDeals = deals?.filter((deal) => deal.is_private).length ?? 0;

  const totalPrice =
    deals?.reduce((total, deal) => {
      return total + Number(deal.price);
    }, 0) ?? 0;

  useEffect(() => {
    async function getDeals() {
      const supabase = createClient();
      setLoading(true);

      try {
        const { data, error } = await supabase.from("deals").select("*");

        if (error) {
          console.log(error);
          toast.error("something went wrong")
          return;
        }
        setDeals(data ?? [])
      } finally{
        setLoading(false);
      }
    }
    getDeals();
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
                {loading ? "---" : allDeals}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Public Deals</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "---" : publicDeals}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Private Deals</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "---" : privateDeals}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? "---" : totalPrice}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}
