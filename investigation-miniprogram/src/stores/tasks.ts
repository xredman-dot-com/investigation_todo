import { createStore } from "./createStore"
import { initialTasksState, type TasksState } from "../features/tasks/model/state"

export const tasksStore = createStore<TasksState>(initialTasksState, {
  key: "store:tasks",
  ttlMs: 10 * 60 * 1000,
})
