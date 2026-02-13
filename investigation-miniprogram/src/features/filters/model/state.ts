import type { FilterItem, TaskItem } from "./index"

export type FiltersState = {
  filters: FilterItem[]
  previewTasks: TaskItem[]
  activeFilterId: string | null
  loading: boolean
  error: string | null
}

export const initialFiltersState: FiltersState = {
  filters: [],
  previewTasks: [],
  activeFilterId: null,
  loading: false,
  error: null,
}
