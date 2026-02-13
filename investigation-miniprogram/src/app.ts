import { ensureAuth } from "./core/auth"
import { getTheme } from './core/theme'

App<IAppOption>({
  globalData: {
    token: "",
    user: null,
    theme: getTheme()
  },
  onLaunch() {
    // 初始化主题
    this.globalData.theme = getTheme()

    ensureAuth().catch((error) => {
      console.warn("auth failed", error)
    })
  },
})
