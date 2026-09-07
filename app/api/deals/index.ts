import { createClient } from "@/lib/supabase/client";

export async function creatDealAPI(
  title: string,
  city: string,
  price: string,
  is_private: boolean,
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: userError || new Error("User not authenticated") };
    }

    const { error } = await supabase.from("deals").insert({
      title,
      city,
      price,
      is_private,
      broker_id: user.id,
    });

    return { error };
  } catch (e) {
    return { error: e };
  }
}
