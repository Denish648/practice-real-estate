import { createClient } from "@/lib/supabase/client";

export async function ChangePassowordAPI(password: string) {
  try {
    const supabase = createClient();
    await supabase.auth.updateUser({ password });
  } catch (e) {
    return { userData: null, error: e };
  }
}
