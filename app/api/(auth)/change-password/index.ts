import { createClient } from "@/lib/supabase/client";

export async function ChangePassowordAPI(password: string) {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  } catch (e) {
    if (e instanceof Error) {
      return { error: e };
    }
    return { error: new Error("something went wrong") };
  }
}
