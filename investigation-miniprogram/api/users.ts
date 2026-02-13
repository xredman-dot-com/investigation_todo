import { request } from "../utils/request"

export type UserProfile = {
  id: string
  openid: string
  nickname?: string | null
  avatar_url?: string | null
  role: string
  status: string
  created_at: string
  updated_at: string
}

export function getMe(): Promise<UserProfile> {
  return request<UserProfile>({ url: "/users/me" })
}
