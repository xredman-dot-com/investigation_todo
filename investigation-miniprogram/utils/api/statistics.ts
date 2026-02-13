import { request } from "../request"
import type { DailyStat } from "./types"

export function dailyStats(startDate?: string, endDate?: string): Promise<DailyStat[]> {
  return request<DailyStat[]>({
    url: "/statistics/daily",
    params: { start_date: startDate, end_date: endDate },
  })
}
