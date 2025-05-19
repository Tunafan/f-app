<template>
  <q-page class="flex column q-pa-md">
    <div class="welcome-section q-mb-lg">
      <h4 class="q-mb-sm">Hello {{ userName || "Fisher" }}, we love you!</h4>
      <p>Check out the expansion menu on the left for navigation.</p>
    </div>

    <q-card class="weather-card q-mb-lg">
      <q-card-section>
        <div class="text-h6">Weather Information</div>
        <div v-if="loading">Loading weather data...</div>
        <div v-else-if="weatherError">{{ weatherError }}</div>
        <div v-else-if="weather" class="weather-info">
          <div class="row items-center">
            <q-icon
              :name="getWeatherIcon(weather.condition)"
              size="3rem"
              class="q-mr-md"
            />
            <div>
              <div class="text-h5">{{ weather.temperature }}°C</div>
              <div>{{ weather.condition }}</div>
              <div>{{ weather.location }}</div>
            </div>
          </div>
          <div class="q-mt-sm">
            <div>Wind: {{ weather.wind }} km/h</div>
            <div>Humidity: {{ weather.humidity }}%</div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="recent-activity">
      <q-card-section>
        <div class="text-h6">Recent Activity</div>
        <q-list>
          <q-item v-for="(activity, index) in recentActivities" :key="index">
            <q-item-section avatar>
              <q-icon :name="activity.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ activity.title }}</q-item-label>
              <q-item-label caption>{{ activity.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import { supabase } from "src/boot/supabase";

export default {
  name: "IndexPage",
  setup() {
    const userName = ref(null);
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

    const getWeatherIcon = (condition) => {
      const conditionLower = condition.toLowerCase();
      if (conditionLower.includes("sun") || conditionLower.includes("clear"))
        return "wb_sunny";
      if (conditionLower.includes("cloud")) return "cloud";
      if (conditionLower.includes("rain")) return "grain";
      if (conditionLower.includes("snow")) return "ac_unit";
      if (
        conditionLower.includes("storm") ||
        conditionLower.includes("thunder")
      )
        return "flash_on";
      return "cloud";
    };

    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (data) {
          userName.value = data.full_name;
        }
      }
    };

    const getWeatherData = async () => {
      try {
        // In a real app, you would get the user's location and then fetch weather data
        // For now, we'll use mock data
        weather.value = {
          temperature: 22,
          condition: "Partly Cloudy",
          location: "This location",
          wind: 12,
          humidity: 65,
        };
      } catch (error) {
        console.error(error);
        weatherError.value =
          "Failed to load weather data. Please enable location services.";
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      getCurrentUser();
      getWeatherData();
    });

    return {
      userName,
      weather,
      loading,
      weatherError,
      recentActivities,
      getWeatherIcon,
    };
  },
};
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
