<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h5">
          My Virtual Toolbox
        </div>
        <div class="text-subtitle2 q-mb-md">
          Add, view, and manage your fishing gear and tools.
        </div>
        <q-form @submit.prevent="addGear">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="newGear.name"
                label="Tool/Gear Name"
                outlined
                dense
                :rules="[(val) => !!val || 'Required']"
              />
            </div>
            <div class="col-12 col-md-5">
              <q-input
                v-model="newGear.description"
                label="Description"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-2 flex flex-center">
              <q-btn
                label="Add"
                color="primary"
                type="submit"
                class="full-width"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-list
          bordered
          separator
        >
          <q-item
            v-for="(gear, idx) in gearList"
            :key="idx"
          >
            <q-item-section>
              <div class="text-subtitle1">
                {{ gear.name }}
              </div>
              <div class="text-caption">
                {{ gear.description }}
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
          <q-item v-if="gearList.length === 0">
            <q-item-section>
              <div class="text-grey">
                No gear added yet. Start by adding your first tool!
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
  import { ref } from 'vue'

  const gearList = ref([])

  const newGear = ref({
    name: '',
    description: '',
  })

  function addGear() {
    if (!newGear.value.name) return
    gearList.value.push({
      name: newGear.value.name,
      description: newGear.value.description,
    })
    newGear.value.name = ''
    newGear.value.description = ''
  }

  function removeGear(idx) {
    gearList.value.splice(idx, 1)
  }
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
</style>
