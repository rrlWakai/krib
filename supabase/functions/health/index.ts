import { handleCors, corsHeaders } from '../_shared/cors.ts'
import { getAdminClient } from '../_shared/adminClient.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ status: 'error', timestamp: new Date().toISOString(), database: 'unknown' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const admin = getAdminClient()
    const { error } = await admin.from('villas').select('id').limit(1).maybeSingle()

    const healthy = !error || error.code === 'PGRST116'

    return new Response(
      JSON.stringify({
        status: healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: healthy ? 'connected' : 'unreachable',
        ...(healthy ? {} : { detail: error.message }),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'unknown',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
