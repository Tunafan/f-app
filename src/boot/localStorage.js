// Initialize auth from localStorage to prevent need for hard refreshes on Firebase
export default async ({ store } /* { app, router, Vue ... } */) => {
  store.dispatch('auth/initializeStore', null, { root: true });
  store.dispatch('region/initializeStore', null, { root: true });
};
