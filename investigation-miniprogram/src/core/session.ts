import { settingsStore } from "../stores/settings"
import { getToken, setToken, clearToken } from "./storage"
import type { AuthUser } from "./authTypes"

const USER_KEY = "auth_user"

export type SessionSnapshot = {
  token: string
  user: AuthUser | null
}

export const getSessionSnapshot = (): SessionSnapshot => {
  const user = settingsStore.getState().user as AuthUser | null
  if (user) {
    return { token: getToken(), user }
  }
  const cached = wx.getStorageSync(USER_KEY) as AuthUser | null
  return { token: getToken(), user: cached || null }
}

export const setSessionUser = (user: AuthUser, token?: string) => {
  settingsStore.setState({ user })
  wx.setStorageSync(USER_KEY, user)
  if (token) {
    setToken(token)
  }
}

export const clearSession = () => {
  settingsStore.setState({ user: null })
  wx.removeStorageSync(USER_KEY)
  clearToken()
}
