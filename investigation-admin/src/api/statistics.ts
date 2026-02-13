import { apiRequest } from "./client"

export type DailyStat = {
  stat_date: string
  tasks_created: number
  tasks_completed: number
  tasks_overdue: number
  pomodoro_count: number
  focus_minutes: number
  habits_completed: number
  active_tasks: number
  generated_at: string
}

export function fetchDailyStats(params?: Record<string, any>): Promise<DailyStat[]> {
  return apiRequest<DailyStat[]>("/statistics/daily", { params })
}
