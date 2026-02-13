import { createStore } from "./createStore"
import { initialSettingsState, type SettingsState } from "../features/settings/model/state"

export const settingsStore = createStore<SettingsState>(initialSettingsState, {
  key: "store:settings",
  ttlMs: 10 * 60 * 1000,
})
