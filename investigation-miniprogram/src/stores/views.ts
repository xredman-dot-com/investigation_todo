import { createStore } from "./createStore"
import { initialViewsState, type ViewsState } from "../features/views/model/state"

export const viewsStore = createStore<ViewsState>(initialViewsState, {
  key: "store:views",
  ttlMs: 10 * 60 * 1000,
})
