<template>
  <q-page class="q-pa-md">
    <q-card
      class="q-mx-auto"
      style="max-width: 500px;"
    >
      <q-card-section>
        <div class="text-h5">
          Account Details
        </div>
        <div class="text-subtitle2 q-mb-md">
          View your profile information
        </div>
        <q-separator class="q-my-md" />
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label caption>
                Email
              </q-item-label>
              <q-item-label>{{ user?.email || '—' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>
                User ID
              </q-item-label>
              <q-item-label>{{ user?.id || '—' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>
                Nickname
              </q-item-label>
              <q-item-label>{{ user?.nickname || '—' }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
    <div class="q-pa-md text-center">
      Contact us for any issues or feedback
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from 'src/boot/supabase'

const user = ref(null)

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
})
</script>