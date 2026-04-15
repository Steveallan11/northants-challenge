import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  if (!url || !anonKey) {
    return null;
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookieList) {
        cookieList.forEach((cookie) => {
          cookieStore.set(cookie.name, cookie.value, cookie.options);
        });
      },
    },
  });
}
