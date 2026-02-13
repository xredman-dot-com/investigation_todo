import { cacheClear, cacheGet, cacheSet } from "./storage"

type Listener<T> = (state: T) => void

type PersistOptions = {
  key: string
  ttlMs?: number
}

export type Store<T> = {
  getState: () => T
  setState: (patch: Partial<T> | ((prev: T) => Partial<T>)) => void
  replace: (next: T) => void
  subscribe: (listener: Listener<T>) => () => void
  reset: () => void
}

export function createStore<T extends Record<string, any>>(
  initialState: T,
  persist?: PersistOptions
): Store<T> {
  const cachedState = persist ? cacheGet<T>(persist.key) : null
  let state: T = cachedState ? { ...initialState, ...cachedState } : initialState
  const listeners = new Set<Listener<T>>()
  let lastError: string | null = null

  const notify = () => {
    listeners.forEach((listener) => listener(state))
  }

  const notifyError = () => {
    const nextError = Object.prototype.hasOwnProperty.call(state, "error") ? state.error : null
    if (typeof nextError === "string" && nextError && nextError !== lastError) {
      lastError = nextError
      wx.showToast({ title: nextError, icon: "none" })
      return
    }
    if (!nextError) {
      lastError = null
    }
  }

  const persistState = () => {
    if (!persist) return
    cacheSet(persist.key, state, persist.ttlMs)
  }

  return {
    getState: () => state,
    setState: (patch) => {
      const nextPatch = typeof patch === "function" ? patch(state) : patch
      state = { ...state, ...nextPatch }
      persistState()
      notifyError()
      notify()
    },
    replace: (next) => {
      state = next
      persistState()
      notifyError()
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    reset: () => {
      state = initialState
      lastError = null
      if (persist) {
        cacheClear(persist.key)
      }
      notify()
    },
  }
}
