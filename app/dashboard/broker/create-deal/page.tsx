"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { creatDealAPI } from "@/app/api/deals";

export default function CreateDeal() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        title: "",
        city: "",
        price: "",
        is_private: false,
    });

    const onChangeText = (e: any) => {
        const name = e.target.name;
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await creatDealAPI(
            data.title,
            data.city,
            data.price,
            data.is_private
        );

        if (error) {
            console.log("Error creating deal:", error);
            alert(error);
            setLoading(false);
            return;
        }

        router.push("/dashboard/broker");
        router.refresh();
    };

    return (
        <div className="flex flex-col gap-10 p-5">
            <h1 className="text-black text-4xl">create deal</h1>

            <form className="flex flex-col gap-5 max-w-md" onSubmit={handleSubmit}>
                {/* Title */}
                <div className="flex flex-col gap-2">
                    <label>title</label>
                    <input
                        className="border p-2"
                        type="text"
                        name="title"
                        value={data.title}
                        onChange={onChangeText}
                        required
                    />
                </div>

                {/* City */}
                <div className="flex flex-col gap-2">
                    <label>city</label>
                    <input
                        className="border p-2"
                        type="text"
                        name="city"
                        value={data.city}
                        onChange={onChangeText}
                        required
                    />
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                    <label>price</label>
                    <input
                        className="border p-2"
                        type="text"
                        name="price"
                        value={data.price}
                        onChange={onChangeText}
                        required
                    />
                </div>

                {/* Is Private Checkbox */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="is_private"
                        name="is_private"
                        checked={data.is_private}
                        onChange={onChangeText}
                    />
                    <label htmlFor="is_private">Private Deal (only visible to you)</label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="border px-5 py-2 w-max bg-black text-white disabled:opacity-50"
                >
                    {loading ? "submitting..." : "submit"}
                </button>
            </form>
        </div>
    );
}
