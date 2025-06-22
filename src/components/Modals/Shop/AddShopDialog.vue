<template>
  <q-dialog
    :model-value="modelValue"
    @hide="onDialogHide"
  >
    <q-card class="q-pa-sm">
      <q-card-section class="row items-center">
        <div class="text-h6 ellipsis">
          Add Fishing Shop
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
            label="Shop Name"
            outlined
            :rules="[val => !!val || 'Name is required']"
            autofocus
          />
          <q-input
            v-model="email"
            label="Email"
            outlined
            type="email"
          />
          <q-input
            v-model="phone"
            label="Phone"
            outlined
            type="tel"
          />
          <q-input
            v-model="website"
            label="Website"
            outlined
            type="url"
          />
          <q-input
            v-model="country_code"
            label="Country Code"
            outlined
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
const email = ref('')
const phone = ref('')
const website = ref('')
const country_code = ref('')
const latInput = ref('')
const lngInput = ref('')

watch(() => props.modelValue, (val) => {
  if (val) {
    latInput.value = props.lat || ''
    lngInput.value = props.lng || ''
  } else {
    name.value = ''
    email.value = ''
    phone.value = ''
    website.value = ''
    country_code.value = ''
    latInput.value = ''
    lngInput.value = ''
  }
})

function onDialogHide() {
  emit('update:modelValue', false)
}

async function onSubmitForm() {
  if (!name.value || !latInput.value || !lngInput.value) {
    notifyNegative('Please fill in all required fields.')
    return
  }

  const lat = latInput.value === '' ? null : parseFloat(latInput.value)
  const lng = lngInput.value === '' ? null : parseFloat(lngInput.value)
  const phoneSanitized = phone.value === '' ? null : phone.value

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`${FUNCTIONS_URL}add-shop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        phone: phoneSanitized,
        website: website.value,
        country_code: country_code.value,
        coordinates: [lat, lng]
      })
    })
    const result = await response.json()
    if (!response.ok || result.error) {
      notifyNegative('Error adding shop: ' + (result.error || 'Unknown error'))
    } else {
      notifySuccess('Shop added successfully!')
      emit('update:modelValue', false)
    }
  } catch (err) {
    notifyNegative('Error: ' + err.message)
  }
}
</script>