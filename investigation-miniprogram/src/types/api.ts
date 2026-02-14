export type ListItem = {
  id: string
  user_id: string
  name: string
  icon?: string | null
  color?: string | null
  sort_order?: number | null
  created_at: string
  updated_at: string
}

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
  title_updated_at?: string
  schedule_updated_at?: string
  insights?: string | null
  completion_quality?: number | null
  reflection_time?: number | null
}

export type SubtaskItem = {
  id: string
  task_id: string
  title: string
  is_completed?: boolean | null
  sort_order?: number | null
  created_at: string
  updated_at: string
}

export type AttachmentItem = {
  id: string
  task_id: string
  user_id: string
  file_name: string
  file_type: string
  file_size: number
  cos_url: string
  cos_key: string
  thumbnail_url?: string | null
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

export type FilterCriteria = {
  list_id?: string | null
  status?: string | null
  priority?: number | null
  tag?: string | null
  tags?: string[] | null
  due_date_from?: string | null
  due_date_to?: string | null
  query?: string | null
  is_important?: boolean | null
  eisenhower_quadrant?: string | null
  has_due_date?: boolean | null
}

export type FilterItem = {
  id: string
  user_id: string
  name: string
  icon?: string | null
  color?: string | null
  sort_order?: number | null
  criteria: FilterCriteria
  created_at: string
  updated_at: string
}

export type HabitItem = {
  id: string
  user_id: string
  name: string
  icon?: string | null
  color?: string | null
  frequency: string
  target_count: number
  current_streak: number
  longest_streak: number
  total_completed: number
  reminder_enabled: boolean
  reminder_time?: string | null
  is_positive?: boolean | null
  created_at: string
  updated_at: string
}

export type HabitLogItem = {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
  count: number
  note?: string | null
  created_at: string
}

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

export type CountdownItem = {
  id: string
  user_id: string
  title: string
  target_date: string
  type: string
  calendar_type: string
  lunar_month?: number | null
  lunar_day?: number | null
  created_at: string
  updated_at: string
}

export type DailyStat = {
  stat_date: string
  tasks_created: number
  tasks_completed: number
  tasks_overdue: number
  pomodoro_count: number
  focus_minutes: number
  countup_count: number
  countup_minutes: number
  habits_completed: number
  active_tasks: number
  generated_at: string
}

export type WidgetSummary = {
  date: string
  tasks_due_today: TaskItem[]
  tasks_overdue: TaskItem[]
  tasks_due_today_count: number
  tasks_overdue_count: number
  active_tasks_count: number
  habits_total: number
  habits_completed: number
  pomodoro_count: number
  focus_minutes: number
  countup_count: number
  countup_minutes: number
}

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

export type TimelineBucket = {
  date: string
  tasks: TaskItem[]
}

export type EisenhowerView = {
  q1: TaskItem[]
  q2: TaskItem[]
  q3: TaskItem[]
  q4: TaskItem[]
}
