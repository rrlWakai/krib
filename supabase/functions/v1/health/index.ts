import { handleCors, corsHeaders } from '../../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  const cors = handleCors(req)
  if (cors) return cors

  try {
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')
    const anonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY')

    if (!supabaseUrl || !anonKey) {
      return new Response(
        JSON.stringify({
          status: 'degraded',
          timestamp: new Date().toISOString(),
          database: 'not_configured',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, anonKey)
    const { error } = await supabase.from('_health_check').select('1').limit(1).maybeSingle()

    if (error && !error.message.includes('relation "_health_check" does not exist')) {
      return new Response(
        JSON.stringify({
          status: 'degraded',
          timestamp: new Date().toISOString(),
          database: 'unreachable',
          detail: error.message,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'unknown',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
