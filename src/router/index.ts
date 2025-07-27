import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
// import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () =>
      import(/* webpackChunkName: "HomeView" */ "../views/HomeView.vue"),
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    path: "/game",
    name: "game",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "game" */ "../views/game/index.vue"),
  },
  {
    path: "/video",
    name: "video",

    component: () =>
      import(/* webpackChunkName: "video" */ "../views/video/index.vue"),
  },
  {
    path: "/picture",
    name: "picture",

    component: () =>
      import(/* webpackChunkName: "picture" */ "../views/picture/index.vue"),
  },
  {
    path: "/screenshot",
    name: "screenshot",

    component: () =>
      import(
        /* webpackChunkName: "screenshot" */ "../views/screenshot/index.vue"
      ),
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
