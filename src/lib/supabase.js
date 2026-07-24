import { createClient } from "@supabase/supabase-js"

// These env vars are provided automatically by the Supabase integration.
// Vite is configured (in vite.config.js) to expose the NEXT_PUBLIC_* prefix.
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[v0] Missing Supabase env vars. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
