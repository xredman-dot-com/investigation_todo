import { request } from "../core/request"
import type { WidgetSummary } from "../types/api"

export function widgetSummary(limit?: number): Promise<WidgetSummary> {
  return request<WidgetSummary>({ url: "/widgets/summary", params: { limit } })
}
