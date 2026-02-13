import { request } from "../core/request"
import type { HabitItem, HabitLogItem } from "../types/api"

export function listHabits(): Promise<HabitItem[]> {
  return request<HabitItem[]>({ url: "/habits/" })
}

export function createHabit(data: Record<string, any>): Promise<HabitItem> {
  return request<HabitItem>({ url: "/habits/", method: "POST", data })
}

export function updateHabit(habitId: string, data: Record<string, any>): Promise<HabitItem> {
  return request<HabitItem>({ url: `/habits/${habitId}`, method: "PUT", data })
}

export function deleteHabit(habitId: string): Promise<void> {
  return request<void>({ url: `/habits/${habitId}`, method: "DELETE" })
}

export function listHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLogItem[]> {
  return request<HabitLogItem[]>({
    url: `/habits/${habitId}/logs`,
    params: { start_date: startDate, end_date: endDate },
  })
}

export function createHabitLog(habitId: string, data: { completed_at: string; count?: number; note?: string }): Promise<HabitLogItem> {
  return request<HabitLogItem>({ url: `/habits/${habitId}/logs`, method: "POST", data })
}
