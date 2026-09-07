import { createClient } from "@/lib/supabase/client";

export async function ForgotPassowordAPI(email: string) {
  try {
    const supabase = createClient();
   const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/change-password`,
});
    return { error };
  } catch (e) {
    return { error: e };
  }
}
