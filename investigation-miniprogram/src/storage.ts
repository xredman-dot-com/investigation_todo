// 本地存储工具
export function getToken(): string {
  return wx.getStorageSync('token') || ''
}

export function setToken(token: string): void {
  wx.setStorageSync('token', token)
}

export function removeToken(): void {
  wx.removeStorageSync('token')
}
