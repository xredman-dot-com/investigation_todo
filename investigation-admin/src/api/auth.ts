import { apiRequest } from "./client"

export type TokenResponse = { access_token: string; token_type: string }

export function loginWithCode(code: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/wechat", {
    method: "POST",
    body: JSON.stringify({ code })
  })
}

export function getMe(): Promise<any> {
  return apiRequest<any>("/users/me")
}
