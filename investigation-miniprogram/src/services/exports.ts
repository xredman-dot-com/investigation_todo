import { request } from "../core/request"
import type { ExportPayload } from "../types/api"

export function exportFull(): Promise<ExportPayload> {
  return request<ExportPayload>({ url: "/exports/full" })
}
