import { apiRequest } from "./client"

export type PomodoroSession = {
  id: string
  user_id: string
  task_id?: string | null
  duration: number
  break_duration: number
  type: string
  status: string
  started_at: string
  completed_at?: string | null
  actual_duration?: number | null
  created_at: string
}

export function fetchPomodoroSessions(params?: Record<string, any>): Promise<PomodoroSession[]> {
  return apiRequest<PomodoroSession[]>("/pomodoro/sessions/", { params })
}

export function createPomodoroSession(data: Record<string, any>): Promise<PomodoroSession> {
  return apiRequest<PomodoroSession>("/pomodoro/sessions/", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function updatePomodoroSession(id: string, data: Record<string, any>): Promise<PomodoroSession> {
  return apiRequest<PomodoroSession>(`/pomodoro/sessions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deletePomodoroSession(id: string): Promise<void> {
  return apiRequest<void>(`/pomodoro/sessions/${id}`, { method: "DELETE" })
}
