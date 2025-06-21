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
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  setupLeafletIcons,
  createMap,
  addTileLayer,
  locateUser,
  defaultMapCenter,
  defaultZoom
} from 'src/utils/MapUtils'
import AddShopDialog from 'src/components/Modals/Shop/AddShopDialog.vue'

const showAddShopDialog = ref(false)
const prefillLat = ref('')
const prefillLng = ref('')

onMounted(() => {
  setupLeafletIcons()
  const map = createMap('map', defaultMapCenter, defaultZoom)
  addTileLayer(map)
  locateUser(map)

  let longPressTimer = null

  function startLongPress(e) {
    longPressTimer = setTimeout(() => {
      prefillLat.value = e.latlng.lat
      prefillLng.value = e.latlng.lng
      showAddShopDialog.value = true
    }, 500)
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer)
  }

  map.on('mousedown touchstart', startLongPress)
  map.on('mousemove touchmove', cancelLongPress)
  map.on('mouseup touchend', cancelLongPress)
  map.on('mouseout', cancelLongPress)
})
</script>

<style>
@import "leaflet/dist/leaflet.css";
</style>