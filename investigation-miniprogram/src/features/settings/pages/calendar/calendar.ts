// pages/settings/calendar/calendar.ts
Page({
  data: {
    defaultView: '月视图',
    weekStart: 1,
    showCompleted: true,
    showTaskCount: true,
    highlightToday: true,
    showHolidays: true
  },

  onLoad() {
    this.loadSettings()
  },

  loadSettings() {
    // TODO: Load from backend or storage
    const settings = wx.getStorageSync('calendarSettings') || {}
    const viewMap: Record<number, string> = { 0: '月视图', 1: '周视图', 2: '日视图' }

    this.setData({
      defaultView: viewMap[settings.defaultView || 0],
      weekStart: settings.weekStart !== undefined ? settings.weekStart : 1,
      showCompleted: settings.showCompleted !== false,
      showTaskCount: settings.showTaskCount !== false,
      highlightToday: settings.highlightToday !== false,
      showHolidays: settings.showHolidays !== false
    })
  },

  onDefaultView() {
    const that = this
    wx.showActionSheet({
      itemList: ['月视图', '周视图', '日视图'],
      success: (res) => {
        const views = ['月视图', '周视图', '日视图']
        const viewIndex = res.tapIndex
        that.saveSetting('defaultView', viewIndex)
        // @ts-ignore
        that.setData({ defaultView: views[viewIndex] })
      }
    })
  },

  onWeekStart() {
    const that = this
    wx.showActionSheet({
      itemList: ['周日', '周一'],
      success: (res) => {
        const weekStart = res.tapIndex
        that.saveSetting('weekStart', weekStart)
        // @ts-ignore
        that.setData({ weekStart })
      }
    })
  },

  onShowCompletedChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('showCompleted', e.detail.value)
  },

  onShowTaskCountChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('showTaskCount', e.detail.value)
  },

  onHighlightTodayChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('highlightToday', e.detail.value)
  },

  onShowHolidaysChange(e: WechatMiniprogram.CustomEvent) {
    this.saveSetting('showHolidays', e.detail.value)
  },

  saveSetting(key: string, value: any) {
    const settings = wx.getStorageSync('calendarSettings') || {}
    settings[key] = value

    // @ts-ignore
    this.setData({ [key]: value })

    wx.setStorageSync('calendarSettings', settings)

    // TODO: Sync to backend
    wx.showToast({ title: '设置已保存', icon: 'success' })
  },

  onBack() {
    wx.navigateBack()
  }
})
