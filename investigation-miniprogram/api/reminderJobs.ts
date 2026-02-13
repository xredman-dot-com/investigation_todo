import { request } from "../utils/request"
import type { ReminderItem, SubscriptionMessage } from "./types"

export function dispatchReminders(as_of?: string): Promise<SubscriptionMessage[]> {
  return request<SubscriptionMessage[]>({
    url: "/reminders/dispatch",
    method: "POST",
    params: { as_of },
  })
}

export function listReminderLogs(reminderId?: string): Promise<SubscriptionMessage[]> {
  return request<SubscriptionMessage[]>({ url: "/reminders/logs", params: { reminder_id: reminderId } })
}

export function snoozeReminder(reminderId: string, minutes?: number, remindAt?: string): Promise<ReminderItem> {
  return request<ReminderItem>({
    url: `/reminders/${reminderId}/snooze`,
    method: "PATCH",
    data: { minutes, remind_at: remindAt },
  })
}
