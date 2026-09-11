import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/profile"

type UpdateProfile = Pick<Profile, "name" | "company" | "phone" | "avatar_url">

export async function updateProfileAPI({
  name,
  company,
  phone,
  avatar_url,
}: UpdateProfile) {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: userError || new Error("User not authenticated") }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        company,
        phone,
        avatar_url,
      })
      .eq("id", user.id)

    return { error }
  } catch (e) {
    if (e instanceof Error) return { error: e }
    return { error: new Error("something went wrong") }
  }
}
