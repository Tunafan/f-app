const API_KEY = import.meta.env.VITE_WEATHER_API_KEY


export function getWeatherIcon(code) {
      const map = {
        1000: 'wb_sunny',
        1100: 'wb_sunny',
        1101: 'cloud_queue',
        1102: 'cloud',
        1001: 'cloud',
        4000: 'grain',
        4001: 'umbrella',
        4200: 'umbrella',
        4201: 'umbrella',
        5000: 'ac_unit',
        5100: 'ac_unit',
        5101: 'ac_unit',
        8000: 'flash_on'
      };
      return map[code] || 'cloud_queue';
    }

export async function fetchWeather(lat, lon) {
  const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${API_KEY}&units=metric`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()

  return {
    temperature: Math.round(data.data.values.temperature),
    condition: data.data.values.weatherCode,
    wind: Math.round(data.data.values.windSpeed),
    humidity: data.data.values.humidity,
    pressure: data.data.values.pressureSurfaceLevel,
    dewPoint: Math.round(data.data.values.dewPoint),
    location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  }
}