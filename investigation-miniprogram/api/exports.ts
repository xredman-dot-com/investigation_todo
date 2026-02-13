import { request } from "../utils/request"
import type { ExportPayload } from "./types"

export function exportFull(): Promise<ExportPayload> {
  return request<ExportPayload>({ url: "/exports/full" })
}
