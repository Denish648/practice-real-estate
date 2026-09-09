import { createClient } from "@/lib/supabase/client"

export async function ForgotPasswordAPI(email: string) {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/change-password`,
    })
    return { error }
  } catch (e) {
    if (e instanceof Error) {
      return { error: e }
    }
    return { error: new Error("something went wrong") }
  }
}
