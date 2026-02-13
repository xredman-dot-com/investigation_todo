import { apiRequest } from "./client"
import type { TaskItem } from "./tasks"

export type TimelineBucket = { date: string; tasks: TaskItem[] }
export type EisenhowerView = { q1: TaskItem[]; q2: TaskItem[]; q3: TaskItem[]; q4: TaskItem[] }

export function fetchTimeline(params?: Record<string, any>): Promise<TimelineBucket[]> {
  return apiRequest<TimelineBucket[]>("/views/timeline", { params })
}

export function fetchSmartList(name: string, params?: Record<string, any>): Promise<TaskItem[]> {
  return apiRequest<TaskItem[]>(`/views/smart/${name}`, { params })
}

export function fetchEisenhower(params?: Record<string, any>): Promise<EisenhowerView> {
  return apiRequest<EisenhowerView>("/views/eisenhower", { params })
}
