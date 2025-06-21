<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Fisher App </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="person"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>
          Navigation
        </q-item-label>

        <q-item
          v-ripple
          to="/"
          exact
          clickable
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/map"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="map" />
          </q-item-section>
          <q-item-section>Map</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/packing-list"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="check_box" />
          </q-item-section>
          <q-item-section>Packing List</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/my-gear"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="fishing" />
          </q-item-section>
          <q-item-section>My Gear</q-item-section>
        </q-item>

        <q-item
          v-ripple
          to="/guides"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="menu_book" />
          </q-item-section>
          <q-item-section>Guides</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";

export default {
  name: "MainLayout",
  setup() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
};
</script>
