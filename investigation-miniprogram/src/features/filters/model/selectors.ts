import type { FiltersState } from "./state"

export const selectFilters = (state: FiltersState) => state.filters
export const selectPreviewTasks = (state: FiltersState) => state.previewTasks
export const selectActiveFilterId = (state: FiltersState) => state.activeFilterId
export const selectIsLoading = (state: FiltersState) => state.loading
