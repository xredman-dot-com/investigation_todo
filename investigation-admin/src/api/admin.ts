import { apiFetch } from "./client"

export type UserAdmin = {
  id: string
  openid: string | null
  username: string | null
  unionid: string | null
  nickname: string | null
  avatar_url: string | null
  role: "user" | "admin" | "owner"
  status: "active" | "banned"
  last_login_at: string | null
  admin_remark: string | null
  created_at: string
  updated_at: string
}

export type ModerationItem = {
  id: string
  content_type: string
  content_id: string | null
  content: Record<string, unknown> | unknown[] | null
  content_text: string | null
  status: "pending" | "approved" | "rejected"
  reason: string | null
  review_note: string | null
  created_by: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export type SystemSetting = {
  id: string
  key: string
  value: unknown
  description: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type AuditLog = {
  id: string
  actor_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  detail: Record<string, unknown> | unknown[] | null
  created_at: string
}

export type AdminSummary = {
  users_total: number
  users_active: number
  users_banned: number
  tasks_total: number
  tasks_completed: number
  moderation_pending: number
  settings_count: number
}

export const listUsers = (params: {
  q?: string
  status?: string
  role?: string
  limit?: number
  offset?: number
}) => apiFetch<UserAdmin[]>("/admin/users", {}, params)

export const fetchAdminSummary = () => apiFetch<AdminSummary>("/admin/summary")

export const updateUser = (userId: string, payload: { status?: string; role?: string; admin_remark?: string }) =>
  apiFetch<UserAdmin>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  })

export const listModerationItems = (params: {
  status?: string
  content_type?: string
  q?: string
  limit?: number
  offset?: number
}) => apiFetch<ModerationItem[]>("/admin/moderation", {}, params)

export const updateModerationItem = (itemId: string, payload: { status?: string; review_note?: string }) =>
  apiFetch<ModerationItem>(`/admin/moderation/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  })

export const listSettings = () => apiFetch<SystemSetting[]>("/admin/settings")

export const upsertSetting = (key: string, payload: { value: unknown; description?: string | null }) =>
  apiFetch<SystemSetting>(`/admin/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  })

export const listAuditLogs = (params: {
  action?: string
  resource_type?: string
  actor_id?: string
  q?: string
  limit?: number
  offset?: number
}) => apiFetch<AuditLog[]>("/admin/logs", {}, params)
