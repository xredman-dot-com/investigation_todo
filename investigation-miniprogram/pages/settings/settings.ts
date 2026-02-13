// pages/settings/settings.ts
import { getTheme, setTheme, applyTheme, ThemeName } from '../../utils/theme'

Page({
  data: {
    userInfo: {
      name: '',
      email: ''
    },
    currentTheme: 'default' as ThemeName,
    darkMode: false
  },

  onLoad() {
    const app = getApp<IAppOption>()
    this.setData({
      currentTheme: app.globalData.theme.name,
      darkMode: app.globalData.theme.name === 'dark'
    })

    // Load user info
    this.loadUserInfo()
  },

  loadUserInfo() {
    // TODO: Load user info from backend
    const userInfo = wx.getStorageSync('userInfo') || { name: '', email: '' }
    this.setData({ userInfo })
  },

  onThemeChange(e: WechatMiniprogram.CustomEvent) {
    const { theme } = e.currentTarget.dataset
    const newTheme = theme as ThemeName

    setTheme(newTheme)
    applyTheme(newTheme)

    const app = getApp<IAppOption>()
    app.globalData.theme = getTheme()

    this.setData({
      currentTheme: newTheme,
      darkMode: newTheme === 'dark'
    })

    wx.showToast({ title: '主题已切换', icon: 'success' })
  },

  onDarkModeChange(e: WechatMiniprogram.CustomEvent) {
    const checked = e.detail.value
    const theme: ThemeName = checked ? 'dark' : 'default'

    setTheme(theme)
    applyTheme(theme)

    const app = getApp<IAppOption>()
    app.globalData.theme = getTheme()

    this.setData({
      currentTheme: theme,
      darkMode: checked
    })
  },

  onSetting() {
    wx.showToast({ title: '设置功能开发中', icon: 'none' })
  },

  onBackup() {
    wx.showToast({ title: '备份功能开发中', icon: 'none' })
  },

  onSync() {
    wx.showToast({ title: '同步功能开发中', icon: 'none' })
  },

  onClearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage()
          wx.showToast({ title: '缓存已清除', icon: 'success' })
        }
      }
    })
  },

  onAbout() {
    wx.showModal({
      title: '关于格物清单',
      content: '格物清单是一款简洁高效的任务管理应用\n版本：1.0.0',
      showCancel: false
    })
  },

  onFeedback() {
    wx.showToast({ title: '反馈功能开发中', icon: 'none' })
  }
})
