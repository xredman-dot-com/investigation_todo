import { createStore } from "./createStore"
import { initialPomodoroState, type PomodoroState } from "../features/pomodoro/model/state"

export const pomodoroStore = createStore<PomodoroState>(initialPomodoroState, {
  key: "store:pomodoro",
  ttlMs: 10 * 60 * 1000,
})
