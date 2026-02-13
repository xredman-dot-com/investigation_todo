import { apiRequest } from "./client"

export type SystemSettingItem = {
  id: string
  key: string
  value: any
  description?: string | null
  updated_by?: string | null
  created_at: string
  updated_at: string
}

export type SystemSettingUpdate = {
  value: any
  description?: string | null
}

export function fetchSystemSettings(): Promise<SystemSettingItem[]> {
  return apiRequest<SystemSettingItem[]>("/admin/settings")
}

export function fetchSystemSetting(key: string): Promise<SystemSettingItem> {
  return apiRequest<SystemSettingItem>(`/admin/settings/${key}`)
}

export function updateSystemSetting(key: string, data: SystemSettingUpdate): Promise<SystemSettingItem> {
  return apiRequest<SystemSettingItem>(`/admin/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}
