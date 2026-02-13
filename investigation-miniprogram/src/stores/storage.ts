type CacheEnvelope<T> = {
  value: T
  expiresAt?: number
}

export function cacheGet<T>(key: string): T | null {
  try {
    const payload = wx.getStorageSync(key) as CacheEnvelope<T> | undefined
    if (!payload) return null
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      wx.removeStorageSync(key)
      return null
    }
    return payload.value
  } catch (error) {
    console.warn("cacheGet failed", error)
    return null
  }
}

export function cacheSet<T>(key: string, value: T, ttlMs?: number): void {
  try {
    const payload: CacheEnvelope<T> = {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    }
    wx.setStorageSync(key, payload)
  } catch (error) {
    console.warn("cacheSet failed", error)
  }
}

export function cacheClear(key: string): void {
  try {
    wx.removeStorageSync(key)
  } catch (error) {
    console.warn("cacheClear failed", error)
  }
}
