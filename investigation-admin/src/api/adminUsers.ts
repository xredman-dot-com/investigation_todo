import { apiRequest } from "./client"

export type UserAdminItem = {
  id: string
  openid: string
  unionid?: string | null
  nickname?: string | null
  avatar_url?: string | null
  role: string
  status: string
  last_login_at?: string | null
  admin_remark?: string | null
  created_at: string
  updated_at: string
}

export type UserAdminUpdate = {
  status?: "active" | "banned"
  role?: "user" | "admin" | "owner"
  admin_remark?: string | null
}

export function fetchAdminUsers(params: Record<string, any> = {}): Promise<UserAdminItem[]> {
  return apiRequest<UserAdminItem[]>("/admin/users", { params })
}

export function fetchAdminUser(id: string): Promise<UserAdminItem> {
  return apiRequest<UserAdminItem>(`/admin/users/${id}`)
}

export function updateAdminUser(id: string, data: UserAdminUpdate): Promise<UserAdminItem> {
  return apiRequest<UserAdminItem>(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}
