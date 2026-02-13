import type { TasksState } from "./state"

export const selectTasks = (state: TasksState) => state.tasks
export const selectTasksByListId = (state: TasksState) => state.tasksByListId
export const selectLists = (state: TasksState) => state.lists
export const selectActiveListId = (state: TasksState) => state.activeListId
export const selectIsLoading = (state: TasksState) => state.loading
