export type AuthUser = {
  id: string
  openid?: string
  nickname?: string | null
  avatar_url?: string | null
  role?: string
  status?: string
}
