import { createClient } from "@/lib/supabase/client";

export async function LoginAPI(email: string, password: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { userData: data, error };
  } catch (e) {
    if (e instanceof Error) {
      return { userData: null, error: e };
    }
    return { userData: null, error: new Error("something went wrong") };
  }
}
