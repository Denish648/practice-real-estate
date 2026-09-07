import { createClient } from "@/lib/supabase/server";

export default async function BuyerDashboard() {
    const supabase = await createClient();
    const {data: { user }} = await supabase.auth.getUser();  
    const {data: deals} = await supabase.from("deals").select("*");

    return (
        <>
        <div className="flex flex-col gap-10">
            <h1 className="text-black text-4xl">dashboard - buyer</h1>

            {/* welcome title */}
            <div>
                <h3>welcome, {user?.user_metadata.name}</h3>
            </div>

            {/* my deals */}
            <h1 className="text-3xl">Deals</h1>
            <ol>
                {deals?.map((deal,i) => {
                const {title,city,price} = deal;
                    return <li key={`key-${i}`}>
                                <p>title : {title}</p>
                                <p>city : {city}</p>
                                <p>price : {price}</p>
                            </li>
                })}
            </ol>
        </div>
        </>
    );
}