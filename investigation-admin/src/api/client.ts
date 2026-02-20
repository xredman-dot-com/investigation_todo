export const API_BASE = import.meta.env.VITE_API_BASE || "/api/v1"

export class ApiError extends Error {
  status: number
  info: unknown

  constructor(message: string, status: number, info?: unknown) {
    super(message)
    this.status = status
    this.info = info
  }
}

export const getAuthToken = () => localStorage.getItem("admin_token")

export const setAuthToken = (token: string) => {
  localStorage.setItem("admin_token", token)
}

export const clearAuthToken = () => {
  localStorage.removeItem("admin_token")
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value))
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ""
}

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | number | undefined>
): Promise<T> => {
  const token = getAuthToken()
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}${params ? buildQuery(params) : ""}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    let info: unknown = null
    try {
      info = await response.json()
    } catch {
      info = await response.text()
    }
    if (response.status === 401) {
      clearAuthToken()
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
    throw new ApiError(response.statusText, response.status, info)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
