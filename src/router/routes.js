const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { 
        path: "signup", 
        component: () => import("src/pages/Signup/Signup.vue"),
        meta: { requiresGuest: true }
      },
      { 
        path: "confirmation", 
        component: () => import("src/pages/Signup/Confirmation.vue"),
        meta: { requiresGuest: true }
      },
      { path: "login", component: () => import("src/pages/login.vue"), meta: { requiresGuest: true } },
      { path: "", component: () => import("src/pages/Index.vue"), meta: { requiresAuth: true } },
      { path: "map", component: () => import("src/pages/Map.vue"), meta: { requiresAuth: true } },
      { path: "packing-list", component: () => import("pages/PackingList.vue"), meta: { requiresAuth: true }},
      { path: "my-gear", component: () => import("pages/MyGear.vue"), meta: { requiresAuth: true } },
      { path: "guides", component: () => import("pages/Guides.vue"), meta: { requiresAuth: true } },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
