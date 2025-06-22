import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // Or specify your frontend URL for more security
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders() })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders() })
  }

  const { name, description, price } = await req.json()

  const { data: gear, error: gearError } = await supabase
    .from('gear')
    .insert({ name, description, price })
    .select()
    .single()

  if (gearError) {
    return new Response(JSON.stringify({ error: gearError.message }), { status: 400, headers: corsHeaders() })
  }

  //Link gear to user in user_gear table
  const { error: linkError } = await supabase
    .from('user_gear')
    .insert({ user: user.id, gear: gear.id })

  if (linkError) {
    return new Response(JSON.stringify({ error: linkError.message }), { status: 400, headers: corsHeaders() })
  }

  return new Response(JSON.stringify({ success: true, gear }), { status: 200, headers: corsHeaders() })
})