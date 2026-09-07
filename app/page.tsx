// import { createClient } from "@/lib/supabase/server";

export default async function Home() {
    // const supabase = await createClient();
    // const {
    //     data: { user },
    //     error: userError,
    // } = await supabase.auth.getUser();

    // console.log("HOME USER:", user);
    // console.log("HOME USER ERROR:", userError);

    // const {
    //     data: deals,
    //     error: dealsError,
    // } = await supabase
    //     .from("deals")
    //     .select("*");

    // console.log("HOME DEALS:", deals);
    // console.log("HOME DEALS ERROR:", dealsError);

    return (
        <>
            <h1 className="text-black text-4xl">home</h1>
        </>
    );
}