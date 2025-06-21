<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="auth-container">
        <div class="auth-card">
          <div class="text-center q-mb-lg">
            <h3 class="text-weight-bold">
              Fisher App
            </h3>
          </div>
          <router-view />
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "AuthLayout",
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
