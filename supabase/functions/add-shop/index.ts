import "jsr:@supabase/functions-js/edge-runtime.d.ts"
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders() })
  }

  try {
    const { name, email, phone, website, country_code, coordinates } = await req.json()

    const ip = req.headers.get("x-forwarded-for") || "unknown"

    // Get JWT (if sent by client)
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.replace('Bearer ', '')
    let user = null

    // Use Supabase client to get user info if token is present
    if (token) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      )
      const { data: { user: supaUser }, error: userError } = await supabase.auth.getUser()
      if (!userError && supaUser) {
        user = supaUser
      }
    }

    const logContext = {
      user,
      sent: { name, email, phone, website, country_code, coordinates },
      country_code,
      ip
    }
    console.log("add-shop invoked with information:", JSON.stringify(logContext))

    if (!name || !coordinates || coordinates.length !== 2) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders() })
    }

    // Insert shop into the shops table using Supabase client (recommended)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { error: insertError } = await supabaseService
      .from('shops')
      .insert([{ name, email, phone, website, country_code, coordinates }])

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers: corsHeaders() })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders(),
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: corsHeaders(),
    })
  }
})


