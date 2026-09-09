import { createClient } from "@/lib/supabase/client"

export async function SignupAPI(
  email: string,
  password: string,
  name: string,
  company: string,
  role: string,
  phone: string,
) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company,
          role,
          phone,
        },
      },
    })
    return { userData: data, error }
  } catch (e) {
    if (e instanceof Error) {
      return { userData: null, error: e }
    }
    return { userData: null, error: new Error("something went wrong") }
  }
}
