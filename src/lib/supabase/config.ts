import { env } from '../../config/env'

export function getSupabaseConfig() {
  return { url: env.VITE_SUPABASE_URL, anonKey: env.VITE_SUPABASE_ANON_KEY }
}
