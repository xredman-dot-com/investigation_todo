import type { StatisticsState } from "./state"

export const selectStats = (state: StatisticsState) => state.stats
export const selectIsLoading = (state: StatisticsState) => state.loading
