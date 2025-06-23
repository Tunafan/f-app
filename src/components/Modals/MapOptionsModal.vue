<template>
  <q-dialog v-model="dialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          Options
        </div>
        <div class="text-caption">
          Choose an action for this location:
        </div>
        <div class="q-mt-sm text-caption">
          <q-icon
            name="place"
            color="primary"
          /> {{ lat?.toFixed(5) }}, {{ lng?.toFixed(5) }}
        </div>
      </q-card-section>
      <q-card-actions vertical>
        <q-btn
          label="Get weather and wind for tomorrow"
          color="secondary"
          class="q-mb-sm"
          @click="onWeather"
        />
        <q-btn
          label="Save fishing location"
          color="primary"
          class="q-mb-sm"
          @click="onSaveLocation"
        />
        <q-btn
          label="Add gear shop"
          color="accent"
          text-color="dark"
          @click="onAddShop"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  lat: Number,
  lng: Number
})
const emit = defineEmits(['update:modelValue', 'weather', 'save-location', 'add-shop'])

const dialog = ref(props.modelValue)

watch(() => props.modelValue, val => {
  dialog.value = val
})
watch(dialog, val => {
  if (val !== props.modelValue) emit('update:modelValue', val)
})

function onWeather() {
  emit('weather', { lat: props.lat, lng: props.lng })
  dialog.value = false
}
function onSaveLocation() {
  emit('save-location', { lat: props.lat, lng: props.lng })
  dialog.value = false
}
function onAddShop() {
  emit('add-shop', { lat: props.lat, lng: props.lng })
  dialog.value = false
}
</script>