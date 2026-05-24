import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

export const isSupabaseConfigured = Boolean(
  env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY
);

export const supabase = isSupabaseConfigured
  ? createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
