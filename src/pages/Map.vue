<template>
  <q-page class="flex flex-center">
    <div
      id="map"
      style="height: 100vh; width: 100vw;"
    />
    <q-btn
      label="Add Shop"
      color="primary"
      class="q-mt-md"
      style="position: absolute; top: 16px; right: 16px; z-index: 1000;"
      @click="showAddShopDialog = true"
    />
    <AddShopDialog
      v-model="showAddShopDialog"
      :lat="prefillLat"
      :lng="prefillLng"
    />
    <AddFishingLocation
      v-model="showAddFishingLocationDialog"
      :lat="prefillLat"
      :lng="prefillLng"
    />
    <MapOptionsModal
      v-model="showMapOptionsModal"
      :lat="prefillLat"
      :lng="prefillLng"
      @weather="handleWeather"
      @save-location="handleSaveLocation"
      @add-shop="handleAddShop"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  setupLeafletIcons,
  createMap,
  addTileLayer,
  locateUser,
  defaultMapCenter,
  defaultZoom
} from 'src/utils/MapUtils'
import AddFishingLocation from 'src/components/Modals/AddFishingLocation.vue'
import AddShopDialog from 'src/components/Modals/AddShopDialog.vue'
import MapOptionsModal from 'src/components/Modals/MapOptionsModal.vue'
import { fetchWeather } from 'src/utils/weather'
import { notifySuccess, notifyNegative } from 'src/composables/interactions'
import { supabase } from 'src/boot/supabase'
import L from 'leaflet'

const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL
const showAddShopDialog = ref(false)
const showAddFishingLocationDialog = ref(false)
const showMapOptionsModal = ref(false)
const prefillLat = ref('')
const prefillLng = ref('')
const weatherResult = ref(null)
const publicLocations = ref([])
const userLocations = ref([])
const shops = ref([])

let map
let markers = []

function clearMarkers() {
  markers.forEach(marker => map.removeLayer(marker))
  markers = []
}

function addMarkers() {
  clearMarkers()
  publicLocations.value.forEach(loc => {
    if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
      const popupText = `
        <b>${loc.name || 'Public Location'}</b>
        ${loc.category ? `<br><b>Category:</b> ${loc.category}` : ''}
        ${loc.description ? `<br><b>Description:</b> ${loc.description}` : ''}
      `
      const marker = L.marker(loc.coordinates, {
        icon: L.icon({
          iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon-blue.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41],
          className: 'marker-public'
        })
      }).bindPopup(popupText)
      marker.addTo(map)
      markers.push(marker)
    }
  })

  userLocations.value.forEach(loc => {
    if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
      const popupText = `
        <b>${loc.name || 'My Location'}</b>
        ${loc.category ? `<br><b>Category:</b> ${loc.category}` : ''}
        ${loc.description ? `<br><b>Description:</b> ${loc.description}` : ''}
      `
      const marker = L.marker(loc.coordinates, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41],
          className: 'marker-user'
        })
      }).bindPopup(popupText)
      marker.addTo(map)
      markers.push(marker)
    }
  })

  shops.value.forEach(shop => {
    if (Array.isArray(shop.coordinates) && shop.coordinates.length === 2) {
      const popupText = `
        <b>${shop.name || 'Shop'}</b>
        ${shop.category ? `<br><b>Category:</b> ${shop.category}` : ''}
        ${shop.description ? `<br><b>Description:</b> ${shop.description}` : ''}
      `
      const marker = L.marker(shop.coordinates, {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-shadow.png',
          shadowSize: [41, 41],
          className: 'marker-shop'
        })
      }).bindPopup(popupText)
      marker.addTo(map)
      markers.push(marker)
    }
  })
}

async function handleWeather({ lat, lng }) {
  try {
    const weather = await fetchWeather(lat, lng)
    weatherResult.value = {
      lat, lng,
      ...weather
    }
    notifySuccess(
      `Weather for tomorrow at (${lat.toFixed(3)}, ${lng.toFixed(3)}): ${weather.temperature}°C, ${weather.condition}`
    )
  } catch (error) {
    notifyNegative('Failed to fetch weather.'+ (error.message))
  }
}
function handleSaveLocation({ lat, lng }) {
  prefillLat.value = lat
  prefillLng.value = lng
  showAddFishingLocationDialog.value = true
}
function handleAddShop({ lat, lng }) {
  prefillLat.value = lat
  prefillLng.value = lng
  showAddShopDialog.value = true
}

async function fetchAndCache(url, key, setter) {
  try {
    const session = (await supabase.auth.getSession()).data.session
    if (url.includes('get-user-locations') && !session) {
      notifyNegative("You must be logged in to load your locations.")
      return
    }
    const token = session?.access_token
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(url, { headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Fetch failed')
    setter.value = data
    localStorage.setItem(key, JSON.stringify(data))
    addMarkers()
  } catch (error) {
    const cached = localStorage.getItem(key)
    notifyNegative("Error:" + (error.message) || 'Failed to fetch data. Using cached version if available.')
    if (cached) {
      setter.value = JSON.parse(cached)
      addMarkers()
    }
  }
}

onMounted(() => {
  setupLeafletIcons()
  map = createMap('map', defaultMapCenter, defaultZoom)
  addTileLayer(map)
  locateUser(map)

  let longPressTimer = null

  function startLongPress(e) {
    longPressTimer = setTimeout(() => {
      prefillLat.value = e.latlng.lat
      prefillLng.value = e.latlng.lng
      showMapOptionsModal.value = true
    }, 500)
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer)
  }

  map.on('mousedown touchstart', startLongPress)
  map.on('mousemove touchmove', cancelLongPress)
  map.on('mouseup touchend', cancelLongPress)
  map.on('mouseout', cancelLongPress)

  fetchAndCache(
    FUNCTIONS_URL + 'get-public-fishing-locations',
    'publicLocations',
    publicLocations
  )
  fetchAndCache(
    FUNCTIONS_URL + 'get-user-locations',
    'userLocations',
    userLocations
  )
  fetchAndCache(
    FUNCTIONS_URL + 'get-shops',
    'shops',
    shops
  )
})

watch([publicLocations, userLocations, shops], addMarkers)
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>