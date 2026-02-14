// pages/settings/settings.ts
import { setTheme, getTheme, ThemeName, THEMES, Theme } from '../../../core/theme'
import { settingsStore } from "../../../stores/settings"
import { initPageTheme } from '../../../core/themeMixin'

Page({
  data: {
    userInfo: {
      name: '',
      email: ''
    },
    currentTheme: 'default' as ThemeName,
    darkMode: false,
    themeStyle: '',
    // 主题列表供模板渲染
    themeList: [
      { name: 'default' as ThemeName, label: '默认蓝', class: 'default' },
      { name: 'warm' as ThemeName, label: '暖色橙', class: 'warm' },
      { name: 'dark' as ThemeName, label: '暗夜黑', class: 'dark' },
      { name: 'green' as ThemeName, label: '清新绿', class: 'green' },
      { name: 'purple' as ThemeName, label: '优雅紫', class: 'purple' },
    ]
  },

  onLoad() {
    // 初始化页面主题
    initPageTheme(this)
    
    // 加载当前主题设置
    const theme = getTheme()
    this.setData({
      currentTheme: theme.name,
      darkMode: theme.isDark
    })

    // 加载用户信息
    this.loadUserInfo()
  },

  onShow() {
    // 每次显示页面时刷新主题
    const theme = getTheme()
    this.setData({
      currentTheme: theme.name,
      darkMode: theme.isDark
    })
    initPageTheme(this)
  },

  loadUserInfo() {
    const cached = settingsStore.getState().user
    if (cached) {
      this.setData({
        userInfo: {
          name: cached.nickname || "",
          email: ""
        }
      })
      return
    }

    const userInfo = wx.getStorageSync('userInfo') || { name: '', email: '' }
    this.setData({ userInfo })
  },

  onThemeChange(e: WechatMiniprogram.CustomEvent) {
    const { theme } = e.currentTarget.dataset
    const newTheme = theme as ThemeName

    if (!THEMES[newTheme]) {
      console.warn(`Unknown theme: ${newTheme}`)
      return
    }

    // 应用新主题
    setTheme(newTheme)
    
    // 刷新当前页面样式
    initPageTheme(this)

    this.setData({
      currentTheme: newTheme,
      darkMode: THEMES[newTheme].isDark
    })

    wx.showToast({ title: '主题已切换', icon: 'success' })
    
    console.log(`[Settings] Theme changed to: ${newTheme}`)
  },

  onDarkModeChange(e: WechatMiniprogram.CustomEvent) {
    const checked = e.detail.value
    const theme: ThemeName = checked ? 'dark' : 'default'

    setTheme(theme)
    initPageTheme(this)

    this.setData({
      currentTheme: theme,
      darkMode: checked
    })
    
    wx.showToast({ title: checked ? '深色模式已开启' : '深色模式已关闭', icon: 'success' })
  },

  onSetting(e: WechatMiniprogram.CustomEvent) {
    const { index } = e.currentTarget.dataset
    const pages = [
      '/features/settings/pages/notification/notification',
      '/features/settings/pages/pomodoro/pomodoro',
      '/features/settings/pages/calendar/calendar'
    ]

    if (pages[index]) {
      wx.navigateTo({ url: pages[index] })
    }
  },

  onGoHabits() {
    wx.navigateTo({ url: "/features/habits/pages/index" })
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
          settingsStore.reset()
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
  },

  onAdminCenter() {
    wx.navigateTo({ url: "/features/settings/pages/index" })
  }
})
