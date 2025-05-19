import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const WEATHER_API_KEY = Deno.env.get("WEATHER_API_KEY");
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

serve(async (req) => {
  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
      );
    }

    const weatherUrl = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    return new Response(
      JSON.stringify({
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        location: data.name,
        wind: Math.round(data.wind.speed),
        humidity: data.main.humidity,
        icon: data.weather[0].icon,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
