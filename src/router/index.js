import { i18n } from 'boot/i18n';
import { network } from 'boot/network';
import { get, isEmpty } from 'lodash';
import { notifyWarning } from 'src/composables/interactions';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

import { userRoles } from '../utils/AppUtils';
import routes from './routes';

// We aren't using the function from `useAuth` composable,
// because useStore hook returns undefined in the context of the router

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default ({ store }) => {
  const createHistory = process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.config.js instead!
    // quasar.config.js -> build -> vueRouterMode
    // quasar.config.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    if (network.offlineMode && to.name === 'Encryption') {
      return next();
    }

    // @todo: sometimes user is logged in but there wasn't enough time for userDetails to be fetched
    const isLoggedIn = !isEmpty(store.state.auth.userDetails);

    // non public pages should only be visible to users logged in
    if (!to.meta.public && !isLoggedIn) {
      return next({
        name: 'login',
        query: { ...to.query, redirect: to.fullPath },
      });
    }

    // Prevent access if e-mail is not verified
    if (!to.meta.public
      && (!to.meta.acceptUnverified)
      && (!store.state.auth.emailVerified)) {
      return next({
        path: '/signup/verify-email',
      });
    }

    // Ensure user is signed up to MFA if MFA is required
    if (
      !network.offlineMode
      && !to.meta.public
      && (!to.meta.acceptNoMFA)
      && (store.state.auth.userDetails.requireMFA)
      && (!store.state.auth.userDetails.enrolledMFA)
      && (store.state.auth.emailVerified)
    ) {
      return next({
        path: '/signup/enable-mfa',
      });
    }

    const isInOfflineMode = store.state.network.offlineMode;

    if (isInOfflineMode) {
      const isOfflinePage = to.meta.offlineModePage;

      if (!isOfflinePage) {
        notifyWarning(i18n.t('common.errors.offlineForbiddenPage'));
        return next({
          path: '/',
        });
      }
    }

    const userRole = store.state.auth.userDetails.role;

    // If it is explicitly public or there is no userRoles it is public
    const isPublic = to.meta.public || !to.meta?.roles?.length;
    const isAllowed = isPublic || userRole === userRoles.MANAGER || to.meta?.roles?.includes(userRole);




    if (!isAllowed) {
      notifyWarning(i18n.t('common.errors.forbiddenPage'));
      return next({
        path: '/',
      });
    }
  });

  Router.afterEach((to, from) => {
    if (['login', 'signup'].includes(from.name)) {
      store.dispatch('auth/changeLoaderState', false);
    }


    if (shouldShowAppUpdateBanner() && !to.path.includes('/run/')) {
      const appUpdateInfo = get(store, ['state', 'nativeAppUpdates', 'appUpdateInfo'], {});

      showAppUpdateBanner(() => updateApp(appUpdateInfo.appStore, appUpdateInfo.type));
    }
  });

  return Router;
};
