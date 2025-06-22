import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { useUserStore } from 'src/store/users'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const userStore = useUserStore()
    if (to.meta.requiresGuest && userStore.isAuthenticated) {
      next({ path: '/' })
    } else if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      next({ path: '/login' })
    } else {
      next()
    }
  })

  return Router
})
