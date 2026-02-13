import { request } from "../core/request"
import type { ReminderItem } from "../types/api"

export function listReminders(taskId: string): Promise<ReminderItem[]> {
  return request<ReminderItem[]>({ url: `/tasks/${taskId}/reminders/` })
}

export function createReminders(taskId: string, remindAt: string[], templateId?: string): Promise<ReminderItem[]> {
  return request<ReminderItem[]>({
    url: `/tasks/${taskId}/reminders/`,
    method: "POST",
    data: { remind_at: remindAt, template_id: templateId },
  })
}

export function createRemindersFromOffsets(taskId: string, offsets: number[], templateId?: string): Promise<ReminderItem[]> {
  return request<ReminderItem[]>({
    url: `/tasks/${taskId}/reminders/from-offsets`,
    method: "POST",
    data: { offset_minutes: offsets, template_id: templateId },
  })
}

export function deleteReminder(taskId: string, reminderId: string): Promise<void> {
  return request<void>({ url: `/tasks/${taskId}/reminders/${reminderId}`, method: "DELETE" })
}
