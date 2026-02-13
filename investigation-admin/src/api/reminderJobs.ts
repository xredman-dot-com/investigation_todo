import { apiRequest } from "./client"

export type SubscriptionMessage = {
  id: string
  user_id: string
  task_id?: string | null
  reminder_id?: string | null
  template_id?: string | null
  payload?: Record<string, any> | null
  status: string
  error_message?: string | null
  sent_at?: string | null
  created_at: string
}

export type ReminderItem = {
  id: string
  task_id: string
  remind_at: string
  is_sent: boolean
  template_id?: string | null
  created_at: string
}

export function dispatchReminders(asOf?: string): Promise<SubscriptionMessage[]> {
  return apiRequest<SubscriptionMessage[]>("/reminders/dispatch", {
    method: "POST",
    params: { as_of: asOf }
  })
}

export function listReminderLogs(reminderId?: string): Promise<SubscriptionMessage[]> {
  return apiRequest<SubscriptionMessage[]>("/reminders/logs", {
    params: { reminder_id: reminderId }
  })
}

export function snoozeReminder(reminderId: string, minutes?: number, remindAt?: string): Promise<ReminderItem> {
  return apiRequest<ReminderItem>(`/reminders/${reminderId}/snooze`, {
    method: "PATCH",
    body: JSON.stringify({ minutes, remind_at: remindAt })
  })
}
