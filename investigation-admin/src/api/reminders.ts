import { apiRequest } from "./client"

export type ReminderItem = {
  id: string
  task_id: string
  remind_at: string
  is_sent: boolean
  template_id?: string | null
  created_at: string
}

export function fetchReminders(taskId: string): Promise<ReminderItem[]> {
  return apiRequest<ReminderItem[]>(`/tasks/${taskId}/reminders/`)
}

export function createReminders(taskId: string, remindAt: string[]): Promise<ReminderItem[]> {
  return apiRequest<ReminderItem[]>(`/tasks/${taskId}/reminders/`, {
    method: "POST",
    body: JSON.stringify({ remind_at: remindAt })
  })
}

export function createRemindersFromOffsets(taskId: string, offsets: number[]): Promise<ReminderItem[]> {
  return apiRequest<ReminderItem[]>(`/tasks/${taskId}/reminders/from-offsets`, {
    method: "POST",
    body: JSON.stringify({ offset_minutes: offsets })
  })
}

export function deleteReminder(taskId: string, reminderId: string): Promise<void> {
  return apiRequest<void>(`/tasks/${taskId}/reminders/${reminderId}`, { method: "DELETE" })
}
