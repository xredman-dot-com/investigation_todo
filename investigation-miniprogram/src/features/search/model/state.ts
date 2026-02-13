import type { TaskItem, ListItem } from "./index"

export type SearchState = {
  query: string
  taskResults: TaskItem[]
  listResults: ListItem[]
  history: string[]
  loading: boolean
  error: string | null
}

export const initialSearchState: SearchState = {
  query: "",
  taskResults: [],
  listResults: [],
  history: [],
  loading: false,
  error: null,
}
