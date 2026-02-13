import { apiRequest } from "./client"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"
const TOKEN_KEY = "admin_token"

export type AttachmentItem = {
  id: string
  task_id: string
  user_id: string
  file_name: string
  file_type: string
  file_size: number
  cos_url: string
  cos_key: string
  thumbnail_url?: string | null
  created_at: string
}

export function fetchAttachments(taskId: string): Promise<AttachmentItem[]> {
  return apiRequest<AttachmentItem[]>(`/tasks/${taskId}/attachments/`)
}

export async function uploadAttachment(taskId: string, file: File): Promise<AttachmentItem> {
  const token = localStorage.getItem(TOKEN_KEY)
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const message = payload?.detail || `Upload failed (${response.status})`
    throw new Error(message)
  }

  return response.json() as Promise<AttachmentItem>
}

export function deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
  return apiRequest<void>(`/tasks/${taskId}/attachments/${attachmentId}`, { method: "DELETE" })
}
