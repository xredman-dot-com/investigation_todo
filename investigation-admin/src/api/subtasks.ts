import { apiRequest } from "./client"

export type SubtaskItem = {
  id: string
  task_id: string
  title: string
  is_completed: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export function fetchSubtasks(taskId: string): Promise<SubtaskItem[]> {
  return apiRequest<SubtaskItem[]>(`/tasks/${taskId}/subtasks/`)
}

export function createSubtask(taskId: string, data: Record<string, any>): Promise<SubtaskItem> {
  return apiRequest<SubtaskItem>(`/tasks/${taskId}/subtasks/`, {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function updateSubtask(taskId: string, subtaskId: string, data: Record<string, any>): Promise<SubtaskItem> {
  return apiRequest<SubtaskItem>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
  return apiRequest<void>(`/tasks/${taskId}/subtasks/${subtaskId}`, { method: "DELETE" })
}
