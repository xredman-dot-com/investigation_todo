import { USE_DEV_LOGIN } from "./config"
import { request } from "./request"
import { getToken, setToken } from "./storage"
import { clearSession, setSessionUser } from "./session"
import type { AuthUser } from "./authTypes"

async function wxLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error("login code missing"))
        }
      },
      fail: reject,
    })
  })
}

export async function login(): Promise<string> {
  let code = ""

  // In development mode, always use dev code
  if (USE_DEV_LOGIN) {
    code = `dev-${Date.now()}`
  } else {
    try {
      code = await wxLogin()
    } catch (error) {
      throw error
    }
  }

  const data = await request<{ access_token: string }>(
    {
      url: "/auth/wechat",
      method: "POST",
      data: { code },
    }
  )
  setToken(data.access_token)
  return data.access_token
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>({ url: "/users/me" })
}

export async function ensureAuth(): Promise<void> {
  const token = getToken()
  if (token) {
    try {
      const user = await fetchCurrentUser()
      const app = getApp<{ globalData: { user: AuthUser | null; token: string } }>()
      app.globalData.user = user
      app.globalData.token = token
      setSessionUser(user, token)
      return
    } catch (error) {
      clearSession()
    }
  }

  const newToken = await login()
  const user = await fetchCurrentUser()
  const app = getApp<{ globalData: { user: AuthUser | null; token: string } }>()
  app.globalData.user = user
  app.globalData.token = newToken
  setSessionUser(user, newToken)
}
