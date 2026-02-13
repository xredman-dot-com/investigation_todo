import type { ListItem, SubscriptionMessage } from "./index"
import type { UserProfile } from "../services"

export type SettingsState = {
  user: UserProfile | null
  lists: ListItem[]
  subscriptions: SubscriptionMessage[]
  loading: boolean
  error: string | null
}

export const initialSettingsState: SettingsState = {
  user: null,
  lists: [],
  subscriptions: [],
  loading: false,
  error: null,
}
