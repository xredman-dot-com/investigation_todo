import { createStore } from "./createStore"
import { initialHabitsState, type HabitsState } from "../features/habits/model/state"

export const habitsStore = createStore<HabitsState>(initialHabitsState, {
  key: "store:habits",
  ttlMs: 10 * 60 * 1000,
})
