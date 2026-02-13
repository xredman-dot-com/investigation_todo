// pages/habits/habits.ts
Page({
  data: {
    habits: [] as any[],
    monthlyStats: {
      total: 0,
      completed: 0,
      streak: 0
    }
  },

  onLoad() {
    this.loadHabits()
  },

  async loadHabits() {
    // TODO: Load habits from backend
    const habits = [
      { id: 1, name: '早起', icon: '🌅', streak: 7, completed: false },
      { id: 2, name: '运动', icon: '💪', streak: 3, completed: true },
      { id: 3, name: '阅读', icon: '📚', streak: 14, completed: false },
      { id: 4, name: '冥想', icon: '🧘', streak: 5, completed: false }
    ]

    const completedCount = habits.filter((h: any) => h.completed).length
    const maxStreak = Math.max(...habits.map((h: any) => h.streak))

    this.setData({
      habits,
      monthlyStats: {
        total: habits.length,
        completed: completedCount,
        streak: maxStreak
      }
    })
  },

  onCheckIn(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    const habits = this.data.habits.map((h: any) => {
      if (h.id === id) {
        return { ...h, completed: !h.completed, streak: h.completed ? h.streak - 1 : h.streak + 1 }
      }
      return h
    })

    const completedCount = habits.filter((h: any) => h.completed).length
    const maxStreak = Math.max(...habits.map((h: any) => h.streak))

    this.setData({
      habits,
      monthlyStats: {
        total: habits.length,
        completed: completedCount,
        streak: maxStreak
      }
    })

    // TODO: Save to backend
    wx.showToast({ title: '打卡成功！', icon: 'success' })
  },

  onCreateHabit() {
    // TODO: Open habit creation modal
    wx.showToast({ title: '创建习惯功能开发中', icon: 'none' })
  },

  onHabitDetail(e: WechatMiniprogram.CustomEvent) {
    const { id } = e.currentTarget.dataset
    console.log('View habit detail:', id)
    // TODO: Navigate to habit detail page
  }
})
