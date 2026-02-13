import type { HabitsState } from "./state"

export const selectHabits = (state: HabitsState) => state.habits
export const selectHabitLogs = (state: HabitsState) => state.logs
export const selectActiveHabitId = (state: HabitsState) => state.activeHabitId
export const selectIsLoading = (state: HabitsState) => state.loading
