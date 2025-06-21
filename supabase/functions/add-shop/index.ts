import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET"
}

Deno.serve(async (req) => {
  // Handle preflight (OPTIONS) requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { name, email, phone, website, country_code, coordinates } = await req.json()

    const ip = req.headers.get("x-forwarded-for") || "unknown"

    // Get JWT (if sent by client)
    const authHeader = req.headers.get("authorization")
    let user = null
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const jwt = authHeader.slice(7)
      // Optionally decode JWT here to get user info (requires a JWT library)
      user = jwt // or decode it for more info
    }

    const logContext = {
      user,
      sent: { name, email, phone, website, country_code, coordinates },
      country_code,
      ip
    }
    console.log("add-shop invoked with information:", JSON.stringify(logContext))

    if (!name || !coordinates || coordinates.length !== 2) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders })
    }

    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/rest/v1/shops`,
      {
        method: "POST",
        headers: {
          "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },
        body: JSON.stringify([{ name, email, phone, website, country_code, coordinates }])
      }
    )
    const data = await response.json()

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: corsHeaders,
    })
  }
})


