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
