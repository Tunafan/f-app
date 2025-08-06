<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Fisher App </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          :icon="weather ? getWeatherIcon(weather.condition) : 'cloud_queue'"
          :label="weather ? weather.temperature + '°C' : ''"
          style="margin-right: 8px;"
        >
          <q-tooltip v-if="weather">
            {{ weather.pressure }} hPa<br>
            {{ weather.temperature }}°C
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="person"
          aria-label="User menu"
        >
          <q-menu
            anchor="top right"
            self="top right"
            fit
            auto-close
          >
            <q-list style="min-width: 150px">
              <q-item
                clickable
                @click="goToAccount"
              >
                <q-item-section avatar>
                  <q-icon name="account_circle" />
                </q-item-section>
                <q-item-section>Account</q-item-section>
              </q-item>
              <q-item
                clickable
                @click="goToHelp"
              >
                <q-item-section avatar>
                  <q-icon name="help_outline" />
                </q-item-section>
                <q-item-section>Help</q-item-section>
              </q-item>
              <q-item
                clickable
                @click="logout"
              >
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <q-item
          v-ripple
          to="/"
          exact
          clickable
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/map"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="map" />
          </q-item-section>
          <q-item-section>Map</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/packing-list"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="check_box" />
          </q-item-section>
          <q-item-section>Packing List</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/my-gear"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="phishing" />
          </q-item-section>
          <q-item-section>My Gear</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/guides"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="menu_book" />
          </q-item-section>
          <q-item-section>Guides</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { onLogout } from 'src/utils/authUtils'
import { fetchWeather, getWeatherIcon } from 'src/utils/weather';
import { notifyNegative } from "src/composables/interactions";

export default {
  name: "MainLayout",
  setup() {
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const weather = ref(null);

    async function logout() {
      await onLogout(router)
    }
    function goToAccount() {
      router.push("/account");
    }
    function goToHelp() {
      router.push("/help");
    }

    async function updateWeather() {
      try {
        navigator.geolocation.getCurrentPosition(async pos => {
          const { latitude, longitude } = pos.coords;
          weather.value = await fetchWeather(latitude, longitude);
        }, async () => {
          // fallback: Copenhagen
          weather.value = await fetchWeather(55.6761, 12.5683);
          notifyNegative("Failed to fetch your location, using default.");
        });
      } catch (error) {
        notifyNegative("Failed to fetch weather data, using default location.");
        notifyNegative(error.message || "Weather data unavailable");
      }
    }

    onMounted(() => {
      updateWeather();
    });

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      logout,
      goToAccount,
      goToHelp,
      weather,
      getWeatherIcon
    };
  },
};
</script>
