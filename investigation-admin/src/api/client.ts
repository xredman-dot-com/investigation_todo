const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"

const TOKEN_KEY = "admin_token"

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { params?: Record<string, any> } = {}
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const token = localStorage.getItem(TOKEN_KEY)
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  }

  const response = await fetch(url.toString(), {
    ...options,
    headers
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const message = payload?.detail || `Request failed (${response.status})`
    throw new Error(message)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json() as Promise<T>
}
