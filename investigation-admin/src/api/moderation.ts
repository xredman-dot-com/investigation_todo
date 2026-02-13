import { apiRequest } from "./client"

export type ModerationItem = {
  id: string
  content_type: string
  content_id?: string | null
  content?: Record<string, any> | any[] | null
  content_text?: string | null
  status: "pending" | "approved" | "rejected"
  reason?: string | null
  review_note?: string | null
  created_by?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
  updated_at: string
}

export type ModerationCreate = {
  content_type: string
  content_id?: string | null
  content?: Record<string, any> | any[] | null
  content_text?: string | null
  reason?: string | null
}

export type ModerationUpdate = {
  status?: "pending" | "approved" | "rejected"
  review_note?: string | null
}

export function fetchModerationItems(params: Record<string, any> = {}): Promise<ModerationItem[]> {
  return apiRequest<ModerationItem[]>("/admin/moderation", { params })
}

export function createModerationItem(data: ModerationCreate): Promise<ModerationItem> {
  return apiRequest<ModerationItem>("/admin/moderation", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function updateModerationItem(id: string, data: ModerationUpdate): Promise<ModerationItem> {
  return apiRequest<ModerationItem>(`/admin/moderation/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}
