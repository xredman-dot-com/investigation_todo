import type { SettingsState } from "./state"

export const selectUser = (state: SettingsState) => state.user
export const selectLists = (state: SettingsState) => state.lists
export const selectSubscriptions = (state: SettingsState) => state.subscriptions
export const selectIsLoading = (state: SettingsState) => state.loading
