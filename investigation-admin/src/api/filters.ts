import { apiRequest } from "./client"
import type { TaskItem } from "./tasks"

export type FilterItem = {
  id: string
  user_id: string
  name: string
  icon?: string | null
  color?: string | null
  sort_order?: number | null
  criteria: Record<string, any>
  created_at: string
  updated_at: string
}

export function fetchFilters(): Promise<FilterItem[]> {
  return apiRequest<FilterItem[]>("/filters/")
}

export function createFilter(data: Record<string, any>): Promise<FilterItem> {
  return apiRequest<FilterItem>("/filters/", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function updateFilter(id: string, data: Record<string, any>): Promise<FilterItem> {
  return apiRequest<FilterItem>(`/filters/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteFilter(id: string): Promise<void> {
  return apiRequest<void>(`/filters/${id}`, { method: "DELETE" })
}

export function fetchFilterTasks(id: string): Promise<TaskItem[]> {
  return apiRequest<TaskItem[]>(`/filters/${id}/tasks`)
}
