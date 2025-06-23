import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }
}

serve(async (req) => {

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
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, 
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders() })
  }

  const body = await req.json()
  const { name, description, coordinates, is_private, photo_url } = body

  const { error } = await supabase
    .from('locations')
    .insert([{
      owned_by: user.id,
      coordinates,
      name,
      description,
      is_private,
      photo_url
    }])

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders() })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders() })
})