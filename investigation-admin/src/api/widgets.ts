import { apiRequest } from "./client"
import type { TaskItem } from "./tasks"

export type WidgetSummary = {
  date: string
  tasks_due_today: TaskItem[]
  tasks_overdue: TaskItem[]
  tasks_due_today_count: number
  tasks_overdue_count: number
  active_tasks_count: number
  habits_total: number
  habits_completed: number
  pomodoro_count: number
  focus_minutes: number
}

export function fetchWidgetSummary(limit?: number): Promise<WidgetSummary> {
  return apiRequest<WidgetSummary>("/widgets/summary", { params: { limit } })
}
