import { apiFetch } from "./client"

export type TokenResponse = {
  access_token: string
  token_type: string
}

export const adminLogin = (payload: { username: string; password: string }) =>
  apiFetch<TokenResponse>("/auth/admin", {
    method: "POST",
    body: JSON.stringify(payload)
  })
