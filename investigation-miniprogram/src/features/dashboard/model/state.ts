import type { WidgetSummary } from "./index"

export type DashboardState = {
  summary: WidgetSummary | null
  loading: boolean
  error: string | null
}

export const initialDashboardState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
}
