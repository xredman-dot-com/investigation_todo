import { createStore } from "./createStore"
import { initialSearchState, type SearchState } from "../features/search/model/state"

export const searchStore = createStore<SearchState>(initialSearchState, {
  key: "store:search",
  ttlMs: 5 * 60 * 1000,
})
