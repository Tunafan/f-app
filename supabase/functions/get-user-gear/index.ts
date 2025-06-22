import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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

  // Get all gear for the current user via user_gear join
  const { data, error } = await supabase
    .from('user_gear')
    .select('gear(*), id')
    .eq('user', user.id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders() })
  }

  // Flatten the result to just the gear objects
  const gearList = (data ?? []).map((row: any) => ({
    ...row.gear,
    user_gear_id: row.id
  }))

  return new Response(JSON.stringify({ gear: gearList }), { status: 200, headers: corsHeaders() })
})