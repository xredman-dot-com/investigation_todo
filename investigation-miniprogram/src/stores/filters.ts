import { createStore } from "./createStore"
import { initialFiltersState, type FiltersState } from "../features/filters/model/state"

export const filtersStore = createStore<FiltersState>(initialFiltersState, {
  key: "store:filters",
  ttlMs: 10 * 60 * 1000,
})
