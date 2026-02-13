import type { SearchState } from "./state"

export const selectQuery = (state: SearchState) => state.query
export const selectTaskResults = (state: SearchState) => state.taskResults
export const selectListResults = (state: SearchState) => state.listResults
export const selectHistory = (state: SearchState) => state.history
