import { apiRequest } from "./client"

export type HabitItem = {
  id: string
  user_id: string
  name: string
  icon?: string | null
  color?: string | null
  frequency: string
  target_count: number
  current_streak: number
  longest_streak: number
  total_completed: number
  reminder_enabled: boolean
  reminder_time?: string | null
  created_at: string
  updated_at: string
}

export type HabitLogItem = {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  count: number
  note?: string | null
  created_at: string
}

export function fetchHabits(): Promise<HabitItem[]> {
  return apiRequest<HabitItem[]>("/habits/")
}

export function createHabit(data: Record<string, any>): Promise<HabitItem> {
  return apiRequest<HabitItem>("/habits/", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function updateHabit(id: string, data: Record<string, any>): Promise<HabitItem> {
  return apiRequest<HabitItem>(`/habits/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteHabit(id: string): Promise<void> {
  return apiRequest<void>(`/habits/${id}`, { method: "DELETE" })
}

export function fetchHabitLogs(id: string, params?: Record<string, any>): Promise<HabitLogItem[]> {
  return apiRequest<HabitLogItem[]>(`/habits/${id}/logs`, { params })
}

export function createHabitLog(id: string, data: Record<string, any>): Promise<HabitLogItem> {
  return apiRequest<HabitLogItem>(`/habits/${id}/logs`, {
    method: "POST",
    body: JSON.stringify(data)
  })
}
