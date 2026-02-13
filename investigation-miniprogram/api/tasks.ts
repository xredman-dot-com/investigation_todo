import { request } from "../utils/request"
import type { TaskItem } from "./types"

type ListTasksParams = {
  list_id?: string
  status?: string
  query?: string
  priority?: number
  tag?: string
  tags?: string
  due_date_from?: string
  due_date_to?: string
}

export function listTasks(params?: ListTasksParams): Promise<TaskItem[]> {
  return request<TaskItem[]>({ url: "/tasks/", params })
}

export function getTask(taskId: string): Promise<TaskItem> {
  return request<TaskItem>({ url: `/tasks/${taskId}` })
}

export function createTask(data: Record<string, any>): Promise<TaskItem> {
  return request<TaskItem>({ url: "/tasks/", method: "POST", data })
}

export function updateTask(taskId: string, data: Record<string, any>): Promise<TaskItem> {
  return request<TaskItem>({ url: `/tasks/${taskId}`, method: "PUT", data })
}

export function deleteTask(taskId: string): Promise<void> {
  return request<void>({ url: `/tasks/${taskId}`, method: "DELETE" })
}
