import { request } from "../request"
import type { ExportPayload } from "./types"

export function exportFull(): Promise<ExportPayload> {
  return request<ExportPayload>({ url: "/exports/full" })
}
