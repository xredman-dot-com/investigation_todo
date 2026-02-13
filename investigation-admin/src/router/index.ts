import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"
import { useAuthStore } from "../stores/auth"

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue")
  },
  {
    path: "/",
    component: () => import("../layouts/AdminLayout.vue"),
    children: [
      { path: "", name: "Dashboard", component: () => import("../views/Dashboard.vue") },
      { path: "tasks", name: "Tasks", component: () => import("../views/modules/TasksView.vue") },
      { path: "lists", name: "Lists", component: () => import("../views/modules/ListsView.vue") },
      { path: "filters", name: "Filters", component: () => import("../views/modules/FiltersView.vue") },
      { path: "views/timeline", name: "Timeline", component: () => import("../views/modules/TimelineView.vue") },
      { path: "views/eisenhower", name: "Eisenhower", component: () => import("../views/modules/EisenhowerView.vue") },
      { path: "habits", name: "Habits", component: () => import("../views/modules/HabitsView.vue") },
      { path: "pomodoro", name: "Pomodoro", component: () => import("../views/modules/PomodoroView.vue") },
      { path: "statistics", name: "Statistics", component: () => import("../views/modules/StatisticsView.vue") },
      { path: "reminders", name: "Reminders", component: () => import("../views/modules/RemindersView.vue") },
      { path: "exports", name: "Exports", component: () => import("../views/modules/ExportsView.vue") },
      { path: "users", name: "Users", component: () => import("../views/modules/UsersView.vue") },
      { path: "moderation", name: "Moderation", component: () => import("../views/modules/ModerationView.vue") },
      {
        path: "system-settings",
        name: "SystemSettings",
        component: () => import("../views/modules/SystemSettingsView.vue")
      }
    ],
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.path === "/login") {
    return true
  }
  if (auth.token) {
    if (!auth.user) {
      try {
        await auth.hydrate()
      } catch (error) {
        auth.logout()
        return "/login"
      }
    }
    return true
  }
  return "/login"
})

export default router
