"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function BrokerDashboard() {
    const [deals, setDeals] = useState<any[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });

        supabase.from("deals").select("*").then(({ data }) => {
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
            <h1 className="text-black text-4xl">dashboard - broker</h1>

            {/* welcome title */}
            <div>
                <h3>welcome, {user?.user_metadata?.name}</h3>
            </div>

            {/* create deal */}
            <Link href="/dashboard/broker/create-deal" className="border px-5 w-max">
                create deal
            </Link>

            <br/> <br/>

            {/* Radio filter buttons */}
            <div className="flex gap-5">
                <label className="flex gap-2">
                    <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={filter === "all"}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    all
                </label>

                <label className="flex gap-2">
                    <input
                        type="radio"
                        name="filter"
                        value="public"
                        checked={filter === "public"}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    public
                </label>

                <label className="flex gap-2">
                    <input
                        type="radio"
                        name="filter"
                        value="private"
                        checked={filter === "private"}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    private
                </label>
            </div>

            {/* my deals */}
            <ol className="flex flex-col gap-3">
                {filteredDeals.map((deal, i) => {
                    const { title, city, price, is_private } = deal;
                    return (
                        <li key={`key-${i}`} className="border p-3">
                            <p>title : {title}</p>
                            <p>city : {city}</p>
                            <p>price : {price}</p>
                            <p>status : {is_private ? "private" : "public"}</p>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
