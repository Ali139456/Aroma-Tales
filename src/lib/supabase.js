import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

export const isSupabaseConfigured = Boolean(url && anonKey)

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null

if (import.meta.env.DEV && !isSupabaseConfigured) {
  console.warn(
    '[Aroma Tales] Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  )
}

/**
 * Use when a route or hook requires Supabase; fails fast with a clear message.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    )
  }
  return supabase
}
