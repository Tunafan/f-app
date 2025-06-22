<template>
  <q-page class="flex flex-center">
    <q-card style="min-width:350px;max-width:90vw;">
      <q-card-section>
        <div class="text-h6">
          Sign Up
        </div>
      </q-card-section>
      <q-form @submit.prevent="onSignup">
        <q-card-section>
          <q-input
            v-model="email"
            label="Email"
            type="email"
            outlined
            :rules="[val => !!val || 'Email is required']"
            autofocus
          />
          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
            :rules="[val => !!val || 'Password is required']"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Sign Up"
            type="submit"
            color="primary"
            autocomplete="email"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from 'src/boot/supabase'
import { notifyNegative, notifySuccess } from 'src/composables/interactions'

const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSignup() {
  loading.value = true
  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })
  if (error) {
    notifyNegative(error.message)
    loading.value = false
    return
  }

  notifySuccess('Signup successful! Please check your email for confirmation.')
  setTimeout(() => {
    window.location.href = '/login'
  }, 1000)
  loading.value = false
}
</script>