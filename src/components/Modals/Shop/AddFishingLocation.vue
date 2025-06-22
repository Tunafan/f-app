<template>
  <q-dialog
    :model-value="modelValue"
    @hide="onDialogHide"
  >
    <q-card class="q-pa-sm">
      <q-card-section class="row items-center">
        <div class="text-h6 ellipsis">
          Add Fishing Location
        </div>
        <q-space />
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
        />
      </q-card-section>
      <q-form
        ref="form"
        @submit.prevent="onSubmitForm"
      >
        <q-card-section class="q-pt-none">
          <q-input
            v-model="name"
            label="Location Name"
            outlined
            :rules="[val => !!val || 'Name is required']"
            autofocus
          />
          <q-input
            v-model="description"
            label="Description"
            outlined
            type="textarea"
          />
          <q-input
            v-model="latInput"
            label="Latitude"
            outlined
            type="number"
            :rules="[val => !!val || 'Latitude is required']"
          />
          <q-input
            v-model="lngInput"
            label="Longitude"
            outlined
            type="number"
            :rules="[val => !!val || 'Longitude is required']"
          />
          <q-toggle
            v-model="isPrivate"
            label="Private location (only you can see it)"
            class="q-mt-md"
          />
          <q-uploader
            ref="uploader"
            label="Upload a photo"
            accept="image/*"
            :max-files="1"
            :auto-upload="false"
            class="q-mt-md"
            @added="onFileAdded"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            label="Cancel"
            color="secondary"
          />
          <q-btn
            flat
            label="Add"
            type="submit"
            color="primary"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { notifyNegative, notifySuccess } from 'src/composables/interactions'
import { supabase } from 'src/boot/supabase'

const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL
const props = defineProps({
  modelValue: Boolean,
  lat: [String, Number],
  lng: [String, Number]
})
const emit = defineEmits(['update:modelValue'])

const name = ref('')
const description = ref('')
const latInput = ref('')
const lngInput = ref('')
const isPrivate = ref(false)
const photoFile = ref(null)
const uploader = ref(null)
const loading = ref(false)

watch(() => props.modelValue, (val) => {
  if (val) {
    latInput.value = props.lat || ''
    lngInput.value = props.lng || ''
  } else {
    name.value = ''
    description.value = ''
    latInput.value = ''
    lngInput.value = ''
    isPrivate.value = false
    photoFile.value = null
    if (uploader.value) uploader.value.reset()
  }
})

function onDialogHide() {
  emit('update:modelValue', false)
}

function onFileAdded(files) {
  photoFile.value = files[0] || null
}

async function uploadPhoto() {
  if (!photoFile.value) return null
  const file = photoFile.value
  const filePath = `fishing-locations/${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from('location-photos')
    .upload(filePath, file)
  if (error) {
    notifyNegative('Photo upload failed: ' + error.message)
    return null
  }
  const { data } = supabase.storage
    .from('location-photos')
    .getPublicUrl(filePath)
  return data.publicUrl
}

async function onSubmitForm() {
  if (!name.value || !latInput.value || !lngInput.value) {
    notifyNegative('Please fill in all required fields.')
    return
  }

  loading.value = true
  const lat = latInput.value === '' ? null : parseFloat(latInput.value)
  const lng = lngInput.value === '' ? null : parseFloat(lngInput.value)

  let photoUrl = null
  if (photoFile.value) {
    photoUrl = await uploadPhoto()
    if (!photoUrl) {
      loading.value = false
      return // error already notified
    }
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`${FUNCTIONS_URL}add-fishing-location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        name: name.value,
        description: description.value,
        coordinates: [lat, lng],
        is_private: isPrivate.value,
        photo_url: photoUrl
      })
    })
    const result = await response.json()
    if (!response.ok || result.error) {
      notifyNegative('Error adding location: ' + (result.error || 'Unknown error'))
    } else {
      notifySuccess('Fishing location added successfully!')
      emit('update:modelValue', false)
    }
  } catch (err) {
    notifyNegative('Error: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>