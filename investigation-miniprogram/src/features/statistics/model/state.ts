import type { DailyStat } from "./index"

export type StatisticsState = {
  stats: DailyStat[]
  loading: boolean
  error: string | null
}

export const initialStatisticsState: StatisticsState = {
  stats: [],
  loading: false,
  error: null,
}
