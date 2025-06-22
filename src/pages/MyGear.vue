<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="col">
          <div class="text-h5">
            My toolbox
          </div>
          <div class="text-subtitle2 q-mb-md">
            Add fishing gear and tools to your toolbox 🎣
          </div>
        </div>
        <q-btn
          dense
          flat
          round
          size="sm"
          :icon="showAddForm ? 'unfold_less' : 'unfold_more'"
          :aria-label="showAddForm ? 'Collapse' : 'Expand'"
          class="q-ml-auto"
          @click="showAddForm = !showAddForm"
        />
      </q-card-section>
      <q-card-section v-show="showAddForm">
        <q-form @submit.prevent="addGear">
          <q-input
            v-model="newGear.name"
            label="Gear Name"
            outlined
            dense
            class="q-mb-md"
            :rules="[val => val && val.length > 0 || 'Name is required']"
          />
          <q-input
            v-model="newGear.description"
            label="Description"
            outlined
            dense
            class="q-mb-md"
          />
          <q-input
            v-model.number="newGear.price"
            label="Price (DKK)"
            type="number"
            outlined
            dense
            class="q-mb-md"
            :rules="[val => val === null || val >= 0 || 'Price must be positive']"
          />
          <div class="row">
            <div class="col">
              <q-btn
                label="Add Gear"
                type="submit"
                color="primary"
                :loading="loading"
                class="full-width"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <q-input
        v-model="search"
        label="Search gear"
        outlined
        dense
        class="q-mb-md"
        debounce="200"
        clearable
        prepend-inner-icon="search"
        :style="{ height: '28px', fontSize: '0.85em' }"
      />
      <q-card-section>
        <q-list
          bordered
          separator
        >
          <q-item
            v-for="(gear, idx) in filteredGear.slice(0, itemsToShow)"
            :key="gear.user_gear_id || idx"
            v-touch-pan.horizontal="(info) => onGearPan(info, idx)"
            class="swipe-item"
          >
            <q-item-section>
              <div class="text-subtitle1">
                {{ gear.name }}
              </div>
              <div class="text-caption">
                {{ gear.description }}
                <span
                  v-if="gear.price !== null && gear.price !== undefined"
                  class="q-ml-sm text-bold text-primary"
                >
                  • {{ gear.price }} dkk
                </span>
              </div>
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="delete"
                color="negative"
                flat
                round
                @click="removeGear(idx)"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="filteredGear.length === 0">
            <q-item-section>
              <div class="text-grey">
                No gear found.
              </div>
            </q-item-section>
          </q-item>
        </q-list>
        <q-infinite-scroll
          :offset="100"
          :disable="itemsToShow >= filteredGear.length"
          @load="loadMoreItems"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from 'src/boot/supabase'
import { notifyNegative, notifySuccess } from 'src/composables/interactions'

const showAddForm = ref(true)
const gearList = ref([])
const loading = ref(false)
const FUNCTIONS_URL = import.meta.env.VITE_FUNCTIONS_URL

const newGear = ref({
  name: '',
  description: '',
  price: null
})

const search = ref('')

const itemsToShow = ref(5)
function resetItemsToShow() {
  itemsToShow.value = 5
}
function loadMoreItems(index, done) {
  setTimeout(() => {
    itemsToShow.value += 5
    done()
  }, 300)
}
watch(search, resetItemsToShow)

const filteredGear = computed(() => {
  if (!search.value) return gearList.value
  const term = search.value.toLowerCase()
  return gearList.value.filter(
    gear =>
      (gear.name && gear.name.toLowerCase().includes(term)) ||
      (gear.description && gear.description.toLowerCase().includes(term))
  )
})

onMounted(() => {
  const cached = localStorage.getItem('gearList')
  if (cached) {
    try {
      gearList.value = JSON.parse(cached)
    } catch (error) {
      console.error('Failed to parse cached gear list:', error)
    }
  getUserGear()
}})

async function getUserGear() {
  loading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      notifyNegative('You must be logged in to view your gear.')
      loading.value = false
      return
    }
    const accessToken = session.access_token

    const response = await fetch(`${FUNCTIONS_URL}/get-user-gear`, {
      method: 'GET',
      headers: {
      'Authorization': `Bearer ${accessToken}`
      }
    })
    const result = await response.json()
    if (!response.ok) {
      notifyNegative(result.error || 'Failed to fetch gear')
      loading.value = false
      return
    }
    gearList.value = result.gear || []
  } catch (err) {
    notifyNegative('An error occurred while fetching gear.' + err)
  } finally {
    loading.value = false
  }
}

async function addGear() {
  if (!newGear.value.name) return
  loading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      notifyNegative('You must be logged in to add gear.')
      loading.value = false
      return
    }
    const accessToken = session.access_token

    const response = await fetch(`${FUNCTIONS_URL}/add-gear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: newGear.value.name,
        description: newGear.value.description,
        price: newGear.value.price
      })
    })

    const result = await response.json()
    if (!response.ok) {
      notifyNegative(result.error || 'Failed to add gear')
      loading.value = false
      return
    }

    gearList.value.push(result.gear)
    notifySuccess('Gear added!')
    newGear.value.name = ''
    newGear.value.description = ''
    newGear.value.price = null
  } catch (err) {
    notifyNegative('An error occurred while adding gear.' + err)
    console.error('Error adding gear:', err)
  } finally {
    loading.value = false
  }
}

async function unlinkUserGear(idx) {
  const gear = gearList.value[idx]
  if (!gear || !gear.user_gear_id) {
    notifyNegative('Could not determine which gear to unlink.')
    return
  }
  loading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      notifyNegative('You must be logged in to remove gear.')
      loading.value = false
      return
    }
    const accessToken = session.access_token

    const response = await fetch(`${FUNCTIONS_URL}/unlink-user-gear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ user_gear_id: gear.user_gear_id })
    })

    const result = await response.json()
    if (!response.ok) {
      notifyNegative(result.error || 'Failed to remove gear from your toolbox')
      loading.value = false
      return
    }

    gearList.value.splice(idx, 1)
    notifySuccess('Gear removed from your toolbox!')
  } catch (err) {
    notifyNegative('An error occurred while removing gear.' + err)
    console.error('Error removing gear:', err)
  } finally {
    loading.value = false
  }
}

function onGearPan(info, idx) {
  // info.direction === 'right' means swipe right
  if (info.isFinal && info.direction === 'right' && Math.abs(info.delta.x) > 20) {
    unlinkUserGear(idx)
  }
}

function removeGear(idx) {
  unlinkUserGear(idx)
}

watch(gearList, (val) => {
  localStorage.setItem('gearList', JSON.stringify(val))
}, { deep: true })

</script>

<style scoped>
.q-page {
  background-color: #f4f7fa;
}

.q-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
}

.q-card-section {
  padding: 16px;
}

.text-h5 {
  font-weight: 500;
  color: #333;
}

.text-subtitle2 {
  color: #666;
}

.q-form {
  margin-top: 16px;
}

.q-list {
  margin-top: 16px;
}

.q-item {
  cursor: pointer;
}

.q-item:hover {
  background-color: #f1f1f1;
}

.q-separator {
    margin: 8px 0;
  }

.swipe-item {
  transition: background 0.2s;
}
</style>
