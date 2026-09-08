import { createClient } from "../supabase/server";

export async function getUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return { user, error };
  } catch (e) {
    return { user: null, error: e };
  }
}
