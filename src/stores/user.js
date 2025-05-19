import { defineStore } from "pinia";
import { supabase } from "src/boot/supabase";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    profile: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userName: (state) => state.profile?.full_name || "Fisher",
  },

  actions: {
    async fetchUser() {
      this.loading = true;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        this.user = user;

        if (user) {
          await this.fetchProfile();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", this.user.id)
          .single();

        this.profile = data;
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    },

    async signOut() {
      try {
        await supabase.auth.signOut();
        this.user = null;
        this.profile = null;
      } catch (error) {
        console.error("Error signing out:", error);
      }
    },
  },
});
