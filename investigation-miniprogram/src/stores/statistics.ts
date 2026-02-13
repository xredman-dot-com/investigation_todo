import { createStore } from "./createStore"
import { initialStatisticsState, type StatisticsState } from "../features/statistics/model/state"

export const statisticsStore = createStore<StatisticsState>(initialStatisticsState, {
  key: "store:statistics",
  ttlMs: 30 * 60 * 1000,
})
