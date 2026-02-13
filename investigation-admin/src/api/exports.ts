import { apiRequest } from "./client"
import type { TaskItem } from "./tasks"
import type { ListItem } from "./lists"
import type { HabitItem, HabitLogItem } from "./habits"
import type { PomodoroSession } from "./pomodoro"
import type { ReminderItem } from "./reminders"
import type { AttachmentItem } from "./attachments"
import type { SubtaskItem } from "./subtasks"

export type ExportPayload = {
  generated_at: string
  user_id: string
  lists: ListItem[]
  tasks: TaskItem[]
  subtasks: SubtaskItem[]
  attachments: AttachmentItem[]
  reminders: ReminderItem[]
  habits: HabitItem[]
  habit_logs: HabitLogItem[]
  pomodoro_sessions: PomodoroSession[]
}

export function exportFull(): Promise<ExportPayload> {
  return apiRequest<ExportPayload>("/exports/full")
}
