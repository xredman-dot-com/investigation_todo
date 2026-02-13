import { request } from "../request"
import type { WidgetSummary } from "./types"

export function widgetSummary(limit?: number): Promise<WidgetSummary> {
  return request<WidgetSummary>({ url: "/widgets/summary", params: { limit } })
}
