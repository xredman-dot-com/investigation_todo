import { request } from "../request"
import type { EisenhowerView, TaskItem, TimelineBucket } from "./types"

type ViewParams = {
  list_id?: string
  status?: string
  priority?: number
  tag?: string
  tags?: string
}

export function timelineView(params?: ViewParams & { start_date?: string; end_date?: string }): Promise<TimelineBucket[]> {
  return request<TimelineBucket[]>({ url: "/views/timeline", params })
}

export function smartList(name: string, params?: ViewParams): Promise<TaskItem[]> {
  return request<TaskItem[]>({ url: `/views/smart/${name}`, params })
}

export function eisenhowerView(params?: ViewParams): Promise<EisenhowerView> {
  return request<EisenhowerView>({ url: "/views/eisenhower", params })
}
