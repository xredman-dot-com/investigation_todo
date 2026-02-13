import type { CalendarState } from "./state"

export const selectTasksByDate = (state: CalendarState) => state.tasksByDate
export const selectSelectedDate = (state: CalendarState) => state.selectedDate
export const selectIsLoading = (state: CalendarState) => state.loading
