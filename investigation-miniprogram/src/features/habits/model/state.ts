import type { HabitItem, HabitLogItem } from "./index"

export type HabitsState = {
  habits: HabitItem[]
  logs: HabitLogItem[]
  activeHabitId: string | null
  loading: boolean
  error: string | null
}

export const initialHabitsState: HabitsState = {
  habits: [],
  logs: [],
  activeHabitId: null,
  loading: false,
  error: null,
}
