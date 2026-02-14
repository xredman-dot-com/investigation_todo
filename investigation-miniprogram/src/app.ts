import { ensureAuth } from "./core/auth"
import { initTheme, getTheme } from './core/theme'

App<IAppOption>({
  globalData: {
    token: "",
    user: null,
    theme: getTheme()
  },
  
  onLaunch() {
    // 初始化主题系统 - 这会加载保存的主题并应用到 CSS 变量
    const theme = initTheme()
    console.log(`[App] Theme initialized: ${theme.label}`)
    
    // 更新全局数据
    this.globalData.theme = theme

    ensureAuth().catch((error) => {
      console.warn("auth failed", error)
    })
  },
})
