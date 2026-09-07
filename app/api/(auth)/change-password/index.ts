import { createClient } from "@/lib/supabase/client";

export async function ChangePassowordAPI(password: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  } catch (e) {
    return { userData: null, error: e };
  }
}
