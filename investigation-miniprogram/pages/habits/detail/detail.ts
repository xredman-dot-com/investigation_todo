// pages/habits/detail/detail.ts
Page({
  data: {
    habitId: '',
    habit: {} as any,
    frequencyLabels: ['每天', '每周', '每月'],
    monthlyData: [] as Array<{ day: number; checked: boolean }>,
    recentRecords: [] as Array<{ id: string; date: string; time: string; checked: boolean }>,
    todayChecked: false
  },

  onLoad(options: Record<string, string>) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }

    this.setData({ habitId: id })
    this.loadHabit()
  },

  async loadHabit() {
    wx.showLoading({ title: '加载中...' })
    try {
      // TODO: Load habit from backend
      const habit = {
        id: this.data.habitId,
        name: '早起',
        icon: '🌅',
        frequency: 0,
        reminder: '06:00',
        total_days: 30,
        current_streak: 7,
        longest_streak: 14
      }

      this.setData({ habit })
      this.generateMonthlyData()
      this.generateRecentRecords()
      this.checkTodayStatus()

      wx.setNavigationBarTitle({ title: habit.name })
    } catch (error) {
      console.error('Failed to load habit:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  generateMonthlyData() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // TODO: Load actual check-in data from backend
    const monthlyData: Array<{ day: number; checked: boolean }> = []

    for (let day = 1; day <= daysInMonth; day++) {
      // Simulate some check-ins (random pattern)
      const checked = Math.random() > 0.3
      monthlyData.push({ day, checked })
    }

    this.setData({ monthlyData })
  },

  generateRecentRecords() {
    // TODO: Load from backend
    const recentRecords = [
      { id: '1', date: '02-13', time: '06:00', checked: true },
      { id: '2', date: '02-12', time: '06:05', checked: true },
      { id: '3', date: '02-11', time: '06:10', checked: true },
      { id: '4', date: '02-10', time: '06:00', checked: true },
      { id: '5', date: '02-09', time: '06:00', checked: true },
      { id: '6', date: '02-08', time: '06:00', checked: true },
      { id: '7', date: '02-07', time: '', checked: false }
    ]

    this.setData({ recentRecords })
  },

  checkTodayStatus() {
    const today = new Date()
    const day = today.getDate()
    const todayData = this.data.monthlyData.find(d => d.day === day)

    this.setData({
      todayChecked: todayData?.checked || false
    })
  },

  async onCheckIn() {
    if (this.data.todayChecked) {
      wx.showToast({ title: '今日已打卡', icon: 'none' })
      return
    }

    try {
      // TODO: Save check-in to backend
      const today = new Date()
      const day = today.getDate()

      const monthlyData = [...this.data.monthlyData]
      const todayData = monthlyData.find(d => d.day === day)

      if (todayData) {
        todayData.checked = true
      }

      const habit = { ...this.data.habit }
      habit.current_streak = (habit.current_streak || 0) + 1
      if ((habit.current_streak || 0) > (habit.longest_streak || 0)) {
        habit.longest_streak = habit.current_streak
      }

      this.setData({
        monthlyData,
        habit,
        todayChecked: true
      })

      wx.showToast({ title: '打卡成功！', icon: 'success' })
    } catch (error) {
      console.error('Failed to check in:', error)
      wx.showToast({ title: '打卡失败', icon: 'none' })
    }
  },

  onEdit() {
    wx.showToast({ title: '编辑功能开发中', icon: 'none' })
    // TODO: Navigate to edit page
  },

  onBack() {
    wx.navigateBack()
  }
})
