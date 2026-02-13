import type { PomodoroState } from "./state"

export const selectSessions = (state: PomodoroState) => state.sessions
export const selectActiveSessionId = (state: PomodoroState) => state.activeSessionId
export const selectIsLoading = (state: PomodoroState) => state.loading
