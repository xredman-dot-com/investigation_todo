import { ensureAuth } from "./utils/auth"

App({
  globalData: {
    token: "",
    user: null,
  },
  onLaunch() {
    ensureAuth().catch((error) => {
      console.warn("auth failed", error)
    })
  },
})
