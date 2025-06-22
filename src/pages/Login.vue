<template>
  <div>
    <h5 class="text-center q-mb-md">
      Log In
    </h5>

    <q-form
      class="q-gutter-md"
      @submit="handleLogin"
    >
      <q-input
        v-model="email"
        label="Email"
        type="email"
        outlined
        :rules="[(val) => !!val || 'Email is required']"
      />

      <q-input
        v-model="password"
        label="Password"
        :type="isPwd ? 'password' : 'text'"
        outlined
        :rules="[(val) => !!val || 'Password is required']"
      >
        <template #append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>

      <div>
        <q-btn
          label="Log In"
          type="submit"
          color="primary"
          class="full-width"
          :loading="loading"
        />
      </div>
    </q-form>

    <div class="text-center q-mt-md">
      <p>
        Don't have an account?
        <router-link to="/signup">
          Sign Up
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "src/boot/supabase";
import { notifyNegative, notifySuccess } from "src/composables/interactions";
import { useUserStore } from "src/store/users";

export default {
  name: "LoginPage",
  setup() {
    const email = ref("");
    const password = ref("");
    const isPwd = ref(true);
    const loading = ref(false);
    const router = useRouter();
    const userStore = useUserStore();

    const handleLogin = async () => {
      try {
        loading.value = true;
        const { error } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        });

        if (error) throw error;

        await userStore.fetchUser();

        notifySuccess("Login successful!");
        router.push("/");
      } catch (error) {
        notifyNegative(error.message || "Failed to log in");
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      password,
      isPwd,
      loading,
      handleLogin,
    };
  },
};
</script>
