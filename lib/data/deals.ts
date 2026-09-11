import { brokerSlug, dealSlug } from "@/lib/utils/slug"
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

/**
 * Every deal RLS exposes to an anonymous visitor, newest first, joined with the
 * broker card. `is_private = false` is redundant against the SELECT policies but
 * keeps a signed-in broker's own private deals out of the public pages.
 *
 * The broker join needs the `anon can view broker profiles` policy; without it
 * PostgREST returns the deal rows with `broker: null` rather than failing.
 */
export async function getPublicDeals() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("deals")
      .select("*, broker:profiles(id, name, company, avatar_url)")
      .eq("is_private", false)
      .order("created_at", { ascending: false })

    return { data, error }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e : new Error("failed to load public deals"),
    }
  }
}

/**
 * Resolves `/discover/{broker}/{title}` back to a deal. Slugs are derived, not
 * stored, so the match happens in memory over the public deals. Two listings by
 * the same broker with the same title collapse to one URL — the newest wins.
 */
export async function getPublicDealBySlug(broker: string, deal: string) {
  try {
    const { data, error } = await getPublicDeals()
    if (error || !data) return { data: null, error }

    const byTitle = data.filter((row) => dealSlug(row.title) === deal)

    // prefer the broker named in the URL, fall back to the newest title match
    const match =
      byTitle.find((row) => brokerSlug(row.broker?.name) === broker) ??
      byTitle[0] ??
      null

    return { data: match, error: null }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e : new Error("failed to resolve deal"),
    }
  }
}
