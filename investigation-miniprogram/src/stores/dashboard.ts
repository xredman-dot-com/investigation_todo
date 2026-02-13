import { createStore } from "./createStore"
import { initialDashboardState, type DashboardState } from "../features/dashboard/model/state"

export const dashboardStore = createStore<DashboardState>(initialDashboardState, {
  key: "store:dashboard",
  ttlMs: 10 * 60 * 1000,
})
