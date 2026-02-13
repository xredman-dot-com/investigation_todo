import { apiRequest } from "./client"

export type TaskItem = {
  id: string
  user_id: string
  list_id: string
  title: string
  description?: string | null
  meaning?: string | null
  priority: number
  tags?: string[] | null
  repeat_rule?: Record<string, any> | null
  is_important?: boolean | null
  eisenhower_quadrant?: string | null
  due_date?: string | null
  due_time?: string | null
  status: string
  position?: number | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

export function fetchTasks(params?: Record<string, any>): Promise<TaskItem[]> {
  return apiRequest<TaskItem[]>("/tasks/", { params })
}

export function createTask(data: Record<string, any>): Promise<TaskItem> {
  return apiRequest<TaskItem>("/tasks/", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function updateTask(id: string, data: Record<string, any>): Promise<TaskItem> {
  return apiRequest<TaskItem>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteTask(id: string): Promise<void> {
  return apiRequest<void>(`/tasks/${id}`, { method: "DELETE" })
}
