import { USE_DEV_LOGIN } from "./config"
import { request } from "./request"
import { clearToken, getToken, setToken } from "./storage"

export type AuthUser = {
  id: string
  nickname?: string
  avatar_url?: string
}

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
  try {
    code = await wxLogin()
  } catch (error) {
    if (!USE_DEV_LOGIN) {
      throw error
    }
    code = `dev-${Date.now()}`
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
      return
    } catch (error) {
      clearToken()
    }
  }

  const newToken = await login()
  const user = await fetchCurrentUser()
  const app = getApp<{ globalData: { user: AuthUser | null; token: string } }>()
  app.globalData.user = user
  app.globalData.token = newToken
}
