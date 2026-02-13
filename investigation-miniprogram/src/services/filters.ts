import { request } from "../core/request"
import type { FilterCriteria, FilterItem, TaskItem } from "../types/api"

export function listFilters(): Promise<FilterItem[]> {
  return request<FilterItem[]>({ url: "/filters/" })
}

export function createFilter(data: { name: string; icon?: string; color?: string; sort_order?: number; criteria?: FilterCriteria }): Promise<FilterItem> {
  return request<FilterItem>({ url: "/filters/", method: "POST", data })
}

export function updateFilter(filterId: string, data: { name?: string; icon?: string; color?: string; sort_order?: number; criteria?: FilterCriteria | null }): Promise<FilterItem> {
  return request<FilterItem>({ url: `/filters/${filterId}`, method: "PUT", data })
}

export function deleteFilter(filterId: string): Promise<void> {
  return request<void>({ url: `/filters/${filterId}`, method: "DELETE" })
}

export function filterTasks(filterId: string): Promise<TaskItem[]> {
  return request<TaskItem[]>({ url: `/filters/${filterId}/tasks` })
}
