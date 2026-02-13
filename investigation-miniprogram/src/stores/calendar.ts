import { createStore } from "./createStore"
import { initialCalendarState, type CalendarState } from "../features/calendar/model/state"

export const calendarStore = createStore<CalendarState>(initialCalendarState, {
  key: "store:calendar",
  ttlMs: 10 * 60 * 1000,
})
