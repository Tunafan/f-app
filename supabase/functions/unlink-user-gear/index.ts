import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders()
    })
  }

  let user_gear_id: string | null = null
  let invokedBy: string | null = null

  try {
    const body = await req.json()
    user_gear_id = body.user_gear_id
    if (!user_gear_id) {
      return new Response(JSON.stringify({ error: 'user_gear_id is required' }), {
        status: 400,
        headers: corsHeaders()
      })
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders()
    })
  }

  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    })
  }


  const logContext = {
    invokedBy: user.id,
    functionName: 'unlink-user-gear',
    userGearId: user_gear_id
  }
  console.log('unlink-user-gear logContext:', JSON.stringify(logContext))

  // double check if row belongs to user
  const { error } = await supabase
    .from('user_gear')
    .delete()
    .eq('id', user_gear_id)
    .eq('user', user.id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: corsHeaders()
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders()
  })
})