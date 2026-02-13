import type { DashboardState } from "./state"

export const selectSummary = (state: DashboardState) => state.summary
export const selectIsLoading = (state: DashboardState) => state.loading
