// pages/settings/pomodoro/pomodoro.ts
import { initPageTheme } from "../../../../core/themeMixin"

Page({
  data: {
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreak: false,
    autoStartFocus: false,
    soundEnabled: true,
    vibrateEnabled: true
  },

  onLoad() {
    initPageTheme(this)
    this.loadSettings()
  },

  loadSettings() {
    // TODO: Load from backend or storage
    const settings = wx.getStorageSync('pomodoroSettings') || {}
    this.setData({
      focusTime: settings.focusTime || 25,
      shortBreak: settings.shortBreak || 5,
      longBreak: settings.longBreak || 15,
      autoStartBreak: settings.autoStartBreak || false,
      autoStartFocus: settings.autoStartFocus || false,
      soundEnabled: settings.soundEnabled !== false,
      vibrateEnabled: settings.vibrateEnabled !== false
    })
  },

  onFocusTime() {
    const that = this
    wx.showActionSheet({
      itemList: ['15分钟', '20分钟', '25分钟', '30分钟', '45分钟', '60分钟'],
      success: (res) => {
        const times = [15, 20, 25, 30, 45, 60]
        that.saveSetting('focusTime', times[res.tapIndex])
      }
    })
  },

  onShortBreak() {
    const that = this
    wx.showActionSheet({
      itemList: ['3分钟', '5分钟', '10分钟', '15分钟'],
      success: (res) => {
        const times = [3, 5, 10, 15]
        that.saveSetting('shortBreak', times[res.tapIndex])
      }
    })
  },

  onLongBreak() {
    const that = this
    wx.showActionSheet({
      itemList: ['10分钟', '15分钟', '20分钟', '30分钟'],
      success: (res) => {
        const times = [10, 15, 20, 30]
        that.saveSetting('longBreak', times[res.tapIndex])
      }
    })
  },

  onAutoStartBreakChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('autoStartBreak', e.detail.value)
  },

  onAutoStartFocusChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('autoStartFocus', e.detail.value)
  },

  onSoundEnabledChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('soundEnabled', e.detail.value)
  },

  onVibrateEnabledChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('vibrateEnabled', e.detail.value)
  },

  saveSetting(key: string, value: any) {
    const settings = wx.getStorageSync('pomodoroSettings') || {}
    settings[key] = value

    // @ts-ignore
    this.setData({ [key]: value })

    wx.setStorageSync('pomodoroSettings', settings)

    // TODO: Sync to backend
    wx.showToast({ title: '设置已保存', icon: 'success' })
  },

  onBack() {
    wx.navigateBack()
  }
})
