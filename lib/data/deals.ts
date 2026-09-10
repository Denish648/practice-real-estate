import { createClient } from "../supabase/server"

export async function getDeals(broker_id?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from("deals").select("*")

    if (broker_id) {
      query = query.eq("broker_id", broker_id)
    }
    const { data, error } = await query

    return { data, error }
  } catch (e) {
    return { data: null, error: e }
  }
}

export async function getDealById(id: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("deals")
      .select(
        "*, broker:profiles(id, name, company, phone, avatar_url),images:deal_images(id,path,sort_order)",
      )
      .eq("id", id)
      .single()

    return { data, error }
  } catch (e) {
    return { data: null, error: e }
  }
}
