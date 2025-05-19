<template>
  <refresh-page-spinner v-if="isShowLoader" />
  <router-view />
</template>

<script>
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import CreateEncryptionKeys from "components/Modals/EncryptionKeysDialog.vue";
import RefreshPageSpinner from "components/UI/RefreshPageSpinner";
import { Platform } from "quasar";
import { useMobileMicrosoftAuth } from "src/composables/auth";
import { useCacheCleaner } from "src/composables/cacheCleaner";
import { useNativeAppUpdates } from "src/composables/native-app-updates";
import Auth from "src/mixins/Auth";
import Interactions from "src/mixins/Interactions";
import ServiceWorkerUpdate from "src/mixins/ServiceWorkerUpdate";
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "App",

  components: { RefreshPageSpinner },

  mixins: [ServiceWorkerUpdate, Interactions, Auth],

  setup() {
    const { initializeNativeAppUpdateFlow } = useNativeAppUpdates();
    const { initMobileMicrosoftAuthentication } = useMobileMicrosoftAuth();
    const { startCacheCleaner, stopCacheCleaner } = useCacheCleaner();

    return {
      initializeNativeAppUpdateFlow,
      initMobileMicrosoftAuthentication,
      startCacheCleaner,
      stopCacheCleaner,
    };
  },

  data() {
    return {
      /*
        workflows notifications about to be handled bind to the Firestore.
        todo: move workflows notifications logic to the `triggerNotifications` composable
      */
      inAppNotifications: [],
    };
  },

  computed: {
    ...mapGetters("auth", ["isShowLoader"]),
    ...mapState("auth", ["userDetails", "connectedClinic", "userSettings"]),
    ...mapState("network", ["offlineMode"]),
    ...mapState("userInterface", [
      "encryptionKeysDialogOpen",
      "decryptionKeysDialogOpen",
    ]),

    offlineModeStatus() {
      return JSON.parse(localStorage.getItem("offlineModeStatus")) || false;
    },
  },

  watch: {
    "userDetails.userId": {
      handler(value, prevValue) {
        if (value === prevValue) {
          return;
        }

        if (value) {
          this.bindInAppNotifications();
        } else {
          this.unbindInAppNotifications();
        }
      },
    },

    encryptionKeysDialogOpen(value) {
      if (!value || !this.userHasPrivilege("offline/hasAccess")) {
        return;
      }

      this.openComponentDialog(CreateEncryptionKeys, {}, null, null, null, {
        persistent: true,
      });
    },
  },

  mounted() {
    this.offlineModeSetStatus(this.offlineModeStatus);

    this.networkSetStatus(navigator.onLine);
    window.addEventListener("online", this.setOnline);
    window.addEventListener("offline", this.setOffline);

    if (this.offlineModeStatus) {
      this.$router.push({ name: "Encryption" });
    } else {
      this.handleAuthStateChanged({ context: this });
    }

    this.setupBroadcastChannel({ context: this });

    this.initializeNativeAppUpdateFlow();
    this.initMobileMicrosoftAuthentication();

    // See https://github.com/CodetrixStudio/CapacitorGoogleAuth/issues/364#issuecomment-2176513761 for more details.
    if (Platform.is.capacitor) {
      GoogleAuth.initialize({});
    }

    this.startCacheCleaner(this.invalidateProgramTargetsCache);
  },

  beforeUnmount() {
    this.stopCacheCleaner();

    window.removeEventListener("online", this.setOnline);
    window.removeEventListener("offline", this.setOffline);
  },

  methods: {
    ...mapActions("auth", ["handleAuthStateChanged", "offlineSync"]),
    ...mapActions("network", ["networkSetStatus", "offlineModeSetStatus"]),

    setOnline() {
      this.networkSetStatus(true);
    },
    setOffline() {
      this.networkSetStatus(false);
    },
  },
};
</script>
