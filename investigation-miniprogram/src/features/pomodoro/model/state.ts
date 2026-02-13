import type { PomodoroSession } from "./index"

export type PomodoroState = {
  sessions: PomodoroSession[]
  activeSessionId: string | null
  loading: boolean
  error: string | null
}

export const initialPomodoroState: PomodoroState = {
  sessions: [],
  activeSessionId: null,
  loading: false,
  error: null,
}
