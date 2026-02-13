import type { TaskItem } from "./index"

export type CalendarState = {
  tasksByDate: Record<string, TaskItem[]>
  selectedDate: string
  loading: boolean
  error: string | null
}

export const initialCalendarState: CalendarState = {
  tasksByDate: {},
  selectedDate: "",
  loading: false,
  error: null,
}
