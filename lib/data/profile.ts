import { createClient } from "../supabase/server"
import { getUser } from "./user"

export async function getProfile() {
  try {
    const supabase = await createClient()
    const { user, error: userError } = await getUser()

    if (userError) {
      return { profileData: null, error: userError }
    }

    if (!user) {
      return { profileData: null, error: new Error("Unauthorized") }
    }
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name, company, phone, role, avatar_url")
      .eq("id", user.id)
      .single()

    return { profileData, error: profileError }
  } catch (e) {
    if (e instanceof Error) {
      return { profileData: null, error: e }
    }
    return { profileData: null, error: new Error("Something went wrong") }
  }
}

/**
 * Every broker profile, for the "Discover brokers" rail on the buyer dashboard.
 * RLS exposes `role = 'broker'` rows to any signed-in user (and, since
 * `anon_can_view_broker_profiles`, to anonymous visitors too).
 */
export async function getBrokers() {
  try {
    const supabase = await createClient()

    const { data: brokers, error } = await supabase
      .from("profiles")
      .select("id, name, company, phone, avatar_url")
      .eq("role", "broker")
      .order("name", { ascending: true })

    return { brokers, error }
  } catch (e) {
    return {
      brokers: null,
      error: e instanceof Error ? e : new Error("Failed to load brokers"),
    }
  }
}
