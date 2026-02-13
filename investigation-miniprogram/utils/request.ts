import { API_BASE_URL } from "./config"
import { getToken } from "./storage"

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type RequestOptions = {
  url: string
  method?: RequestMethod
  data?: Record<string, any>
  params?: Record<string, any>
  header?: Record<string, string>
}

function buildUrl(url: string, params?: Record<string, any>): string {
  if (!params) return url
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&")
  return query ? `${url}?${query}` : url
}

export function request<T>(options: RequestOptions): Promise<T> {
  const token = getToken()
  const url = buildUrl(`${API_BASE_URL}${options.url}`, options.params)

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.header || {}),
      },
      success: (res) => {
        const status = res.statusCode || 0
        if (status >= 200 && status < 300) {
          resolve(res.data as T)
          return
        }
        const message = (res.data as any)?.detail || `Request failed (${status})`
        wx.showToast({ title: message, icon: "none" })
        reject(new Error(message))
      },
      fail: (err) => {
        wx.showToast({ title: "Network error", icon: "none" })
        reject(err)
      },
    })
  })
}
