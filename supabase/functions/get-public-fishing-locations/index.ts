import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  }
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_private', false)
    .eq('is_deleted', false)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders() })
  }

  return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders() })
})