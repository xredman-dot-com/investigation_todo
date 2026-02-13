import { request } from "../core/request"
import type { SubtaskItem } from "../types/api"

export function listSubtasks(taskId: string): Promise<SubtaskItem[]> {
  return request<SubtaskItem[]>({ url: `/tasks/${taskId}/subtasks/` })
}

export function createSubtask(taskId: string, data: { title: string; is_completed?: boolean; sort_order?: number }): Promise<SubtaskItem> {
  return request<SubtaskItem>({ url: `/tasks/${taskId}/subtasks/`, method: "POST", data })
}

export function updateSubtask(taskId: string, subtaskId: string, data: { title?: string; is_completed?: boolean; sort_order?: number }): Promise<SubtaskItem> {
  return request<SubtaskItem>({ url: `/tasks/${taskId}/subtasks/${subtaskId}`, method: "PUT", data })
}

export function deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
  return request<void>({ url: `/tasks/${taskId}/subtasks/${subtaskId}`, method: "DELETE" })
}
