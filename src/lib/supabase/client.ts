import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from './config'
import type { Database } from './types'

let client: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (client) return client

  const { url, anonKey } = getSupabaseConfig()

  if (!url || !anonKey) {
    const NullClient = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null, error: null }), data: null, error: null }),
          data: null,
          error: null,
        }),
        insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        delete: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        data: null,
        error: null,
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          remove: async () => ({ data: null, error: null }),
          list: async () => ({ data: [], error: null }),
        }),
      },
      rpc: async () => ({ data: null, error: null }),
    } as unknown as ReturnType<typeof createClient<Database>>

    client = NullClient
    return client
  }

  client = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return client
}

export const supabase = getSupabaseClient()
