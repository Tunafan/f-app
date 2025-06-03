import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { fbConfig } from 'boot/firebase';
import { i18n } from 'boot/i18n';
import { Platform } from 'quasar';
import { LOGIN_METHOD } from 'src/constants/authorization';
import { computed, nextTick, provide, ref } from 'vue';
import { useStore } from 'vuex';

// eslint-disable-next-line import/prefer-default-export
export function useAuth() {
  const store = useStore();

  /**
   * Check if auth token is expired
   * @return {boolean} `true` - expired, `false` - not expired
   */
  function checkIsTokenExpired() {
    return store.state.auth.claims?.exp < (Date.now() / 1000);
  }

  function userHasPrivilege(privilege) {
    const userRole = store.state.auth.userDetails?.role || null;
    const { userPrivileges } = store.state.auth;

    const lockedPrivileges = store.getters['auth/lockedPrivileges'];
    const defaultPrivileges = store.getters['auth/defaultPrivileges'];

    const lockedPrivilege = lockedPrivileges[userRole]?.[privilege];
    const defaultPrivilege = defaultPrivileges[userRole]?.[privilege];

    if (lockedPrivilege) {
      return defaultPrivilege;
    }

    return userPrivileges[privilege] ?? defaultPrivilege;
  }

  const loginMethodsNames = computed(() => {
    return {
      [LOGIN_METHOD.PASSWORD]: i18n.t('login.inputPasswordLabel'),
      [LOGIN_METHOD.GOOGLE]: 'Google',
      [LOGIN_METHOD.APPLE]: 'Apple',
      [LOGIN_METHOD.MICROSOFT]: 'Microsoft',
    };
  });

  /**
   * @param {string} methodId
   */
  function getLoginMethodName(methodId) {
    return loginMethodsNames.value[methodId || ''] || '';
  }

  const msRedirectURI = computed(() => {
    const location = fbConfig.FUNCTIONS_LOCATION;
    const projectId = fbConfig.FIREBASE_PROJECT_ID;

    return `https://${location}-${projectId}.cloudfunctions.net/validateMicrosoftAuth`;
  });

  return {
    checkIsTokenExpired,
    userHasPrivilege,
    loginMethodsNames,
    getLoginMethodName,
    msRedirectURI,
  };
}

export function useMobileMicrosoftAuth() {
  const isNativeApp = Platform.is.capacitor && (Platform.is.ios || Platform.is.android);

  const authToken = ref(null);
  const authError = ref(null);
  provide('authToken', authToken);
  provide('authError', authError);

  async function initMobileMicrosoftAuthentication() {
    if (!isNativeApp) {
      return;
    }

    await App.addListener('appUrlOpen', async (event) => {
      const url = new URL(event.url);
      const token = url.searchParams.has('token');
      const error = url.searchParams.has('authError');

      if (url.pathname !== '/native-app-login') {
        return;
      }

      Browser.close();

      if (token) {
        authToken.value = url.searchParams.get('token');
        await nextTick();
        authToken.value = null;
        return;
      }

      if (error) {
        authError.value = url.searchParams.get('authError');
        await nextTick();
        authError.value = null;
      }
    });
  }

  return {
    initMobileMicrosoftAuthentication,
  };
}
