<template>
  <q-page class="q-pa-none row items-center justify-center">
    <q-card
      class="shadow-24 q-mb-none col-xs-12 col-sm-8 col-md-6 q-px-lg q-pt-lg"
    >
      <q-card-section class="row">
        <div class="col-4" />
        <q-img src="f-app-logo.png" class="col-4" />
        <div class="col-4" />
      </q-card-section>
      <q-form @submit="onLogin">
        <q-card-section class="row">
          <q-input
            v-model="loginData.email"
            type="email"
            :label="$t('login.inputEmailLabel')"
            class="col-12"
            :rules="loginEmailRules"
            autocomplete="username"
          />
          <q-input
            v-model="loginData.password"
            :type="hidePassword ? 'password' : 'text'"
            :label="$t('login.inputPasswordLabel')"
            :rules="loginPasswordRules"
            lazy-rules
            autocomplete="current-password"
            class="col-12"
          >
            <template #append>
              <q-icon
                :name="hidePassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="hidePassword = !hidePassword"
              />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section class="row no-wrap items-center">
          <q-checkbox
            v-model="loginData.rememberEmail"
            :label="$t('login.checkboxRememberEmailLabel')"
          />
          <q-space />
          <q-btn
            flat
            color="primary"
            :label="$t('login.buttonForgotPassword')"
            @click="onShowForgotPassword"
          />
        </q-card-section>
        <q-card-actions class="flex-center">
          <q-btn
            color="primary"
            :label="$t('login.buttonLogin')"
            type="submit"
            class="col-12 q-mb-md"
            :loading="loginSpinner"
          />
          <div class="col-12 row items-center">
            <div class="col">
              <q-separator />
            </div>
            <div class="col-auto q-mx-md text-grey-6">
              {{ orText }}
            </div>
            <div class="col">
              <q-separator />
            </div>
          </div>
          <provider-authorization-buttons
            :display-google="hasGoogleButton"
            :display-apple="hasAppleButton"
            :is-google-loading="googleAuthSpinner"
            :is-apple-loading="appleAuthSpinner"
            :is-microsoft-loading="microsoftAuthSpinner"
            @google-click="onGoogleLogin"
            @apple-click="onAppleLogin"
            @microsoft-click="onMicrosoftLogin(loginData.email)"
          />
          <q-separator
            v-if="!isCapacitorMode && $route.query.signupPath"
            class="q-ma-md full-width"
          />
        </q-card-actions>
      </q-form>
      <q-card-section class="q-pb-none text-grey-5 flex justify-between">
        <span class="text-overline" style="font-size: 8px">
          {{ currentRegionLabel }}
        </span>
        <span class="text-overline" style="font-size: 8px">
          Version: {{ version }}
        </span>
      </q-card-section>
    </q-card>
    <q-dialog v-model="forgotPasswordDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row">
          <div class="text-h6">
            {{ $t("login.textForgotPasswordTitle") }}
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body2">
            {{ $t("login.textForgotPasswordSubtitle") }}
          </div>
        </q-card-section>
        <q-form @submit="onSendResetLink">
          <q-card-section class="q-pt-none">
            <q-input
              ref="resetEmail"
              v-model="forgotPasswordEmail"
              dense
              :label="$t('login.inputResetEmailLabel')"
              :rules="[
                (val) => isValidEmail(val) || $t('login.inputEmailValidator'),
              ]"
              lazy-rules
              autofocus
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat :label="$t('common.buttonCancel')" />
            <q-btn
              flat
              :label="$t('login.buttonSendResetLink')"
              :loading="isLoading"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import Bugsnag from "@bugsnag/js";
import { auth, callFirebaseFunction } from "boot/firebase";
import ProviderAuthorizationButtons from "components/UI/buttons/ProviderAuthorizationButtons";
import VerifyMFA from "components/Users/Modals/VerifyMFA";
import { getMultiFactorResolver } from "firebase/auth";
import { capitalize, chain, get, has, isEmpty, omit, size } from "lodash";
import { notifyNegative, notifySuccess } from "src/composables/interactions";
import { AUTH_ERROR_CODE } from "src/constants/authorization";
import SsoProvidersMixin from "src/mixins/SsoProvidersMixin";
import { isValidEmail } from "src/utils/AppUtils";
import { clearBackups } from "src/utils/backupUtils";
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  /* eslint-disable */
  name: "Login",

  components: { ProviderAuthorizationButtons },

  mixins: [SsoProvidersMixin],

  // Provided by the `useMobileMicrosoftAuth` composable from `App.vue` if we are in the Capacitor mode
  inject: {
    authToken: {
      default: null,
    },

    authError: {
      default: null,
    },
  },

  beforeRouteEnter(to, from, next) {
    next(async (vm) => {
      await vm.checkRegionWithTimeout();

      if (!isEmpty(vm.userDetails)) {
        vm.$router.push("/");
      }

      await vm.microsoftLoginWithQueryData(to.query);
    });
  },

  beforeRouteLeave(to, from, next) {
    next((vm) => {
      if (vm.timeoutId) {
        clearTimeout(vm.timeoutId);
      }
    });
  },

  data() {
    return {
      forgotPasswordDialog: false,
      hidePassword: true,
      loginSpinner: false,
      forgotPasswordEmail: "",
      isLoading: false,

      loginEmailRules: [
        (val) =>
          !chain(val).trim().isEmpty().value() ||
          this.$t("login.inputNoEmailValidator"),
        (val) => isValidEmail(val) || this.$t("login.inputEmailValidator"),
      ],
      loginPasswordRules: [
        (val) => size(val) > 0 || this.$t("login.inputPasswordValidator"),
      ],

      loginData: {
        email: "",
        password: "",
        rememberEmail: false,
      },

      timeoutId: null,
    };
  },

  computed: {
    ...mapState("auth", ["userDetails", "ssoProviders"]),
    ...mapState("region", ["region"]),

    ...mapGetters("region", ["currentRegionLabel", "regionLabel"]),

    version() {
      return process.env.version;
    },

    orText() {
      return capitalize(this.$t("common.or"));
    },

    hasSSOButtons() {
      return this.hasGoogleButton || this.hasAppleButton;
    },

    hasGoogleButton() {
      return this.isCapacitorMode ? true : !!this.gglProvider;
    },

    hasAppleButton() {
      return this.isCapacitorMode ? true : !!this.appleProvider;
    },

    signupPath() {
      return get(this.$route.query, "signupPath", "/signup");
    },
  },

  watch: {
    authToken: {
      handler(token) {
        if (token && isEmpty(this.userDetails)) {
          this.microsoftLoginWithQueryData({ token });
        }
      },
    },

    authError: {
      handler(errMessage) {
        if (errMessage && isEmpty(this.userDetails)) {
          this.microsoftLoginWithQueryData({ authError: errMessage });
        }
      },
    },
  },

  created() {
    // @todo Experimental feature: enable persistance as an option only
    if (has(this.$route.query, "enablePersistance")) {
      localStorage.setItem("forceEnablePersistance", true);
    } else if (has(this.$route.query, "disablePersistance")) {
      localStorage.removeItem("forceEnablePersistance");
    }

    if (this.$route.query.email) {
      this.loginData.email = this.$route.query.email;
    }

    const emailFromLocalStorage = localStorage.getItem("remember_email");

    if (emailFromLocalStorage) {
      this.loginData.email = emailFromLocalStorage;
      this.loginData.rememberEmail = true;
    }
  },

  methods: {
    isValidEmail,
    ...mapActions("auth", ["login", "sendResetPasswordLink"]),
    ...mapActions("region", ["setRegion"]),

    async checkRegionWithTimeout() {
      const TIMEOUT_MS = 4000;
      try {
        await Promise.race([
          this.setRegionFromIp(),
          this.timeout(TIMEOUT_MS).then(() => {
            throw new Error("time-out");
          }),
        ]);
      } catch (error) {
        if (error.message === "time-out") {
          console.warn("setRegionFromIp took too long and was skipped");
        } else {
          Bugsnag.notify(error);
        }
      }
    }, // checkRegionWithTimeout()

    timeout(ms) {
      return new Promise((resolve) => {
        this.timeoutId = setTimeout(() => {
          return resolve();
        }, ms);
      });
    }, // timeout()

    async setRegionFromIp() {
      // Check if selected_region local storage is set
      // otherwise, set it before proceeding.
      if (!localStorage.getItem("selected_region")) {
        try {
          const response = await fetch("https://api.ipify.org?format=json");

          const { ip } = await response.json();
          const { data } = await callFirebaseFunction("getRegionByIp", { ip });

          await this.setRegion({
            region: data.region || "us",
            context: this,
          });
        } catch (error) {
          Bugsnag.notify(error);
        }
      }
    }, // setRegionFromIp()

    async onLogin() {
      // return when login is in progress
      if (this.loginSpinner) {
        return;
      }

      this.loginSpinner = true;

      try {
        await this.login(this.loginData);
        await this.setRegion({
          region: this.region,
          context: this,
        });
      } catch (loginError) {
        if (
          [
            AUTH_ERROR_CODE.USER_NOT_FOUND,
            AUTH_ERROR_CODE.USER_DISABLED,
          ].includes(loginError.code)
        ) {
          try {
            const { data } = await callFirebaseFunction("findUser", {
              email: this.loginData.email,
            });

            // user found
            if (data) {
              await this.setRegion({
                region: data.region,
                context: this,
              });

              this.loginSpinner = false;
              await this.onLogin();
            } else {
              const deletedUserDate = await callFirebaseFunction(
                "findDeletedUser",
                {
                  email: this.loginData.email,
                }
              );
              const deletedTimestamp = get(deletedUserDate, [
                "data",
                "deleteTimestamp",
              ]);
              const deletedDate = new Date(
                deletedTimestamp
              ).toLocaleDateString();

              const errorMessage = deletedTimestamp
                ? this.$t("login.notifyUserWasDeleted", { deletedDate })
                : loginError.message;
              notifyNegative(errorMessage);
              this.loginSpinner = false;
            }
          } catch (findUserError) {
            this.loginSpinner = false;
            Bugsnag.notify(findUserError);
          }
        } else if (loginError.code === AUTH_ERROR_CODE.MULTI_FACTOR_REQUIRED) {
          this.showVerifyMFADialog(loginError);
        } else if (loginError.code === AUTH_ERROR_CODE.NETWORK_REQUEST_FAILED) {
          notifyNegative(this.$t("common.noInternetConnectionMessage"));
        } else {
          this.loginSpinner = false;
          const errorMessage =
            loginError.code === AUTH_ERROR_CODE.WRONG_PASSWORD
              ? this.$t("login.notifyWrongPasswordError")
              : loginError.message;
          notifyNegative(errorMessage);
        }
      } finally {
        this.loginSpinner = false;
        await clearBackups();
      }
    }, // onLogin()

    async microsoftLoginWithQueryData(pageQuery = {}) {
      const { token, authError } = pageQuery || {};
      if (!token && !authError) {
        return;
      }

      // We should remove the token from the history state
      this.$router.replace({
        name: "login",
        query: omit(pageQuery, ["authError", "token"]),
      });

      if (authError) {
        notifyNegative(
          this.$t("login.notifyMicrosoftAuthError", { message: authError })
        );
        return;
      }

      if (token) {
        // Our custom Microsoft auth provider redirected user to the login page along with the auth token in query,
        // so we need to log in using it
        this.microsoftAuthSpinner = true;
        try {
          await this.loginWithCustomToken(token);
        } catch (err) {
          console.error(err);
        } finally {
          this.microsoftAuthSpinner = false;
        }
      }
    }, // microsoftLoginWithQueryData()

    onShowForgotPassword() {
      this.forgotPasswordEmail = this.loginData.email.toLowerCase().trim();
      this.forgotPasswordDialog = true;
    }, // onShowForgotPassword()

    async onSendResetLink() {
      if (!this.$refs.resetEmail.validate() || this.isLoading) {
        return;
      }

      this.isLoading = true;

      try {
        await this.sendResetPasswordLink({ email: this.forgotPasswordEmail });

        notifySuccess(this.$t("login.notifySendResetLinkSuccess"));
      } catch (error) {
        if (error.code === AUTH_ERROR_CODE.NETWORK_REQUEST_FAILED) {
          notifyNegative(this.$t("common.noInternetConnectionMessage"));
        }

        if (error.code === AUTH_ERROR_CODE.USER_NOT_FOUND) {
          const { data } = await callFirebaseFunction("findUser", {
            email: this.forgotPasswordEmail,
          });

          if (data) {
            await this.setRegion({
              region: data.region,
              context: this,
            });
            await this.sendResetPasswordLink({
              email: this.forgotPasswordEmail,
            });
            notifySuccess(this.$t("login.notifySendResetLinkSuccess"));
          }
        }
      } finally {
        this.forgotPasswordDialog = false;
        this.isLoading = false;
      }
    }, // onSendResetLink()

    showVerifyMFADialog(error) {
      this.openComponentDialog(
        VerifyMFA,
        {
          resolver: getMultiFactorResolver(auth, error),
          loginData: this.loginData,
        },
        () => {
          localStorage.setItem("userAuthenticated", "true");
        },
        async () => {
          this.loginSpinner = false;
        }
      );
    }, // showVerifyMFADialog()
  },
};
</script>
