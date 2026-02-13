import { API_BASE_URL } from "../config"
import { getToken } from "../storage"
import { request } from "../request"
import type { AttachmentItem } from "./types"

export function listAttachments(taskId: string): Promise<AttachmentItem[]> {
  return request<AttachmentItem[]>({ url: `/tasks/${taskId}/attachments/` })
}

export function uploadAttachment(taskId: string, filePath: string): Promise<AttachmentItem> {
  const token = getToken()
  const url = `${API_BASE_URL}/tasks/${taskId}/attachments/upload`

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url,
      filePath,
      name: "file",
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(res.data as string)
            resolve(data as AttachmentItem)
            return
          } catch (error) {
            reject(error)
            return
          }
        }
        reject(new Error(`Upload failed (${res.statusCode})`))
      },
      fail: reject,
    })
  })
}

export function deleteAttachment(taskId: string, attachmentId: string): Promise<void> {
  return request<void>({ url: `/tasks/${taskId}/attachments/${attachmentId}`, method: "DELETE" })
}
