import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

let cachedClient: ReturnType<typeof createClient> | null = null

export function getAdminClient(): ReturnType<typeof createClient> {
  if (cachedClient) return cachedClient

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl) {
    throw new Error('Missing required environment variable: SUPABASE_URL')
  }
  if (!serviceRoleKey) {
    throw new Error(
      'Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return cachedClient
}
