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
    return { userData: null, error: e };
  }
}
