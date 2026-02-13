import type { TaskItem, ListItem } from "./index"

export type TasksState = {
  tasks: TaskItem[]
  tasksByListId: Record<string, TaskItem[]>
  lists: ListItem[]
  activeListId: string | null
  loading: boolean
  error: string | null
}

export const initialTasksState: TasksState = {
  tasks: [],
  tasksByListId: {},
  lists: [],
  activeListId: null,
  loading: false,
  error: null,
}
