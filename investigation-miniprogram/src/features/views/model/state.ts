import type { TimelineBucket, EisenhowerView } from "./index"

export type ViewsState = {
  timeline: TimelineBucket[]
  eisenhower: EisenhowerView | null
  loading: boolean
  error: string | null
}

export const initialViewsState: ViewsState = {
  timeline: [],
  eisenhower: null,
  loading: false,
  error: null,
}
