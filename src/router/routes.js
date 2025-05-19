const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "map", component: () => import("pages/MapPage.vue") },
      {
        path: "packing-list",
        component: () => import("pages/PackingListPage.vue"),
      },
      { path: "my-gear", component: () => import("pages/MyGearPage.vue") },
      { path: "guides", component: () => import("pages/GuidesPage.vue") },
    ],
  },
  {
    path: "/auth",
    component: () => import("layouts/AuthLayout.vue"),
    children: [
      { path: "login", component: () => import("pages/Login.vue") },
      {
        path: "register",
        component: () => import("pages/Register.vue"),
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
