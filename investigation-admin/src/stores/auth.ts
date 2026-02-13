import { defineStore } from "pinia"
import { ref } from "vue"
import { getMe, loginWithCode } from "../api/auth"

const TOKEN_KEY = "admin_token"

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || "")
  const user = ref<any | null>(null)

  function setToken(value: string) {
    token.value = value
    if (value) {
      localStorage.setItem(TOKEN_KEY, value)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  async function login(code: string) {
    const data = await loginWithCode(code)
    setToken(data.access_token)
    user.value = await getMe()
  }

  async function hydrate() {
    if (!token.value) return
    user.value = await getMe()
  }

  function logout() {
    setToken("")
    user.value = null
  }

  return { token, user, login, hydrate, logout }
})
