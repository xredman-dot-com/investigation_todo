import { request } from "../utils/request"
import type { PomodoroSession } from "./types"

export function listPomodoroSessions(params?: { start_at?: string; end_at?: string; status_filter?: string; task_id?: string }): Promise<PomodoroSession[]> {
  return request<PomodoroSession[]>({ url: "/pomodoro/sessions/", params })
}

export function createPomodoroSession(data: Record<string, any>): Promise<PomodoroSession> {
  return request<PomodoroSession>({ url: "/pomodoro/sessions/", method: "POST", data })
}

export function updatePomodoroSession(sessionId: string, data: Record<string, any>): Promise<PomodoroSession> {
  return request<PomodoroSession>({ url: `/pomodoro/sessions/${sessionId}`, method: "PUT", data })
}

export function deletePomodoroSession(sessionId: string): Promise<void> {
  return request<void>({ url: `/pomodoro/sessions/${sessionId}`, method: "DELETE" })
}
