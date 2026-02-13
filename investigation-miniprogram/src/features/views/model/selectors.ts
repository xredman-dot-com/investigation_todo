import type { ViewsState } from "./state"

export const selectTimeline = (state: ViewsState) => state.timeline
export const selectEisenhower = (state: ViewsState) => state.eisenhower
export const selectIsLoading = (state: ViewsState) => state.loading
