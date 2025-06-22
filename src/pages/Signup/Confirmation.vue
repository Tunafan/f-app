<template>
  <q-page class="flex flex-center">
    <q-card>
      <q-card-section>
        <div class="text-h6">
          Email Confirmation
        </div>
        <div
          v-if="confirmed"
          class="q-mt-md text-positive"
        >
          Your email has been confirmed! You can now log in here:
          <q-btn
            to="/login"
            label="Login"
            color="primary"
            class="q-ml-sm"
          />
        </div>
        <div
          v-else
          class="q-mt-md"
        >
          Confirming your email...
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { notifyNegative } from 'src/composables/interactions'

const confirmed = ref(false)

onMounted(() => {
  const hash = window.location.hash
  if (hash) {
    const params = Object.fromEntries(new URLSearchParams(hash.slice(1)))
    if (params.type === 'signup' && params.access_token) {
      confirmed.value = true
    } else {
      notifyNegative('Invalid confirmation link.')
    }
  } else {
    notifyNegative('No confirmation token found.')
  }
})
</script>