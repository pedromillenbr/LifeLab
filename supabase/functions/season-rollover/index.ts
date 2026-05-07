// ════════════════════════════════════════════════════════════════════
//  LifeLab — Season rollover Edge Function
//
//  Use this only if pg_cron is NOT available in your Supabase project.
//  Deploy:
//      supabase functions deploy season-rollover
//
//  Schedule via Supabase dashboard (Functions → Schedule):
//      cron: 0 0 1 * *   (1st day of every month at 00:00 UTC)
// ════════════════════════════════════════════════════════════════════
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    return new Response('missing env', { status: 500 })
  }

  const client = createClient(url, key)
  const { data, error } = await client.rpc('close_current_season')
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({ ok: true, snapshotted: data }), {
    headers: { 'content-type': 'application/json' },
  })
})
