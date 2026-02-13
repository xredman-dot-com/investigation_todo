const TOKEN_KEY = "auth_token"

export function getToken(): string {
  return wx.getStorageSync(TOKEN_KEY) || ""
}

export function setToken(token: string): void {
  wx.setStorageSync(TOKEN_KEY, token)
}

export function clearToken(): void {
  wx.removeStorageSync(TOKEN_KEY)
}
