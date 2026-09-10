import { createClient } from "@/lib/supabase/client"
import type { Deal } from "@/lib/types/deal"

type UpdateDeal = Pick<Deal, "price" | "city" | "title" | "is_private">

export async function createDealAPI(
  title: string,
  city: string,
  price: number,
  is_private: boolean,
) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: userError || new Error("User not authenticated") }
    }

    const { data, error } = await supabase
      .from("deals")
      .insert({
        title,
        city,
        price,
        is_private,
        broker_id: user.id,
      })
      .select("id, broker_id")
      .single()

    return { data, error }
  } catch (e) {
    if (e instanceof Error) {
      return { data: null, error: e }
    }
    return { data: null, error: new Error("something went wrong") }
  }
}

export async function updateDealAPI(id: string, data: UpdateDeal) {
  try {
    const supabase = createClient()
    const { title, city, is_private, price } = data
    const { error } = await supabase
      .from("deals")
      .update({ title, city, price, is_private })
      .eq("id", id)

    return { error }
  } catch (e) {
    if (e instanceof Error) {
      return { error: e }
    }
    return { error: new Error("something went wrong") }
  }
}

export async function deleteDealAPI(id: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.from("deals").delete().eq("id", id)

    return { error }
  } catch (e) {
    if (e instanceof Error) {
      return { error: e }
    }
    return { error: new Error("something went wrong") }
  }
}

export async function addDealImage(
  deal_id: string,
  path: string,
  sort_order: number,
) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("deal_images").insert({
      deal_id,
      path,
      sort_order,
    })
    return { error }
  } catch (e) {
    if (e instanceof Error) {
      return { error: e }
    }
    return { error: new Error("something went wrong") }
  }
}
