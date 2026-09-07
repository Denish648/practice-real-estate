import { createClient } from "@/lib/supabase/client";

export async function ForgotPassowordAPI(email: string) {
  try {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/change-password",
    });
  } catch (e) {
    return { userData: null, error: e };
  }
}
