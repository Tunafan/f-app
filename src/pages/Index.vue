<template>
  <q-page class="flex column q-pa-md">
    <div class="welcome-section q-mb-lg">
      <h4 class="q-mb-sm">
        Howdy, {{ nickname || "Angler" }}, good to have you!
      </h4>
    </div>

    <q-card class="weather-card q-mb-lg">
      <q-card-section>
        <div class="text-h6">
          Weather Information
        </div>
        <div v-if="loading">
          Loading weather data...
        </div>
        <div v-else-if="weatherError">
          {{ weatherError }}
        </div>
        <div
          v-else-if="weather"
          class="weather-info"
        >
          <div class="row items-center">
            <q-icon
              :name="getWeatherIcon(weather.condition)"
              size="3rem"
              class="q-mr-md"
            />
            <div>
              <div class="text-h5">
                {{ weather.temperature }}°C
              </div>
              <div>{{ weather.location }}</div>
            </div>
          </div>
          <div class="q-mt-sm">
            <div>Wind: {{ weather.wind }} m/h</div>
            <div>Humidity: {{ weather.humidity }}%</div>
            <div>Dewpoint: {{ weather.dewPoint }} °C</div>
            <div>Pressure: {{ weather.pressure }} hPa</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="recent-activity">
      <q-card-section>
        <div class="text-h6">
          Recent Activity
        </div>
        <q-list>
          <q-item
            v-for="(activity, index) in recentActivities"
            :key="index"
          >
            <q-item-section avatar>
              <q-icon :name="activity.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ activity.title }}</q-item-label>
              <q-item-label caption>
                {{ activity.description }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "src/boot/supabase";
import { fetchWeather, getWeatherIcon } from "src/utils/weather";

const nickname = ref(null);
const weather = ref(null);
const loading = ref(true);
const weatherError = ref(null);

const recentActivities = ref([
  {
    icon: "place",
    title: "New fishing spot added",
    description: "Lake Superior - North Shore",
  },
  {
    icon: "shopping_bag",
    title: "New gear shop discovered",
    description: "Fisher's Paradise - 2.5km away",
  },
  {
    icon: "check_box",
    title: "Packing list updated",
    description: "Weekend Trip - 3 items added",
  },
]);

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("nickname")
      .eq("id", user.id)
      .single();
    if (userData && userData.nickname) {
      nickname.value = userData.nickname;
    }
  }
}

async function getWeatherData() {
  try {
    await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          weather.value = await fetchWeather(lat, lon);
          resolve();
        },
        async () => {
          weather.value = await fetchWeather(55.6761, 12.5683);
          weatherError.value =
            "Location sharing denied. Showing weather for Copenhagen.";
          resolve();
        }
      );
    });
  } catch (error) {
    console.error(error);
    weatherError.value =
      "Failed to load weather data. Please enable location services.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getCurrentUser();
  getWeatherData();
});
</script>

<style scoped>
.weather-card {
  background: linear-gradient(to right, #3494e6, #ec6ead);
  color: white;
}

.weather-info {
  padding: 0.5rem 0;
}
</style>
