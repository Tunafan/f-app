const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "signup", component: () => import("src/pages/Signup/Signup.vue")},
      { path: "confirm", component: () => import("src/pages/Signup/Confirmation.vue")},
      { path: "login", component: () => import("src/pages/login.vue")},
      { path: "", component: () => import("src/pages/Index.vue") },
      { path: "map", component: () => import("src/pages/Map.vue") },
      {
        path: "packing-list",
        component: () => import("pages/PackingList.vue"),
      },
      { path: "my-gear", component: () => import("pages/MyGear.vue") },
      { path: "guides", component: () => import("pages/Guides.vue") },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
