// pages/pomodoro/pomodoro.ts
Page({
  data: {
    timerRunning: false,
    timerDuration: 25 * 60, // 25分钟 in seconds
    timeRemaining: 25 * 60,
    currentTask: null as any,
    sessions: [] as any[],
    todayStats: {
      completedCount: 0,
      totalTime: 0,
      sessions: 0
    },
    showTaskSelector: false
  },

  onLoad() {
    this.startTimer()
  },

  startTimer() {
    this.timerRunning = true
    this.setData({ timerRunning: true })

    // Store interval ID for cleanup
    const interval = setInterval(() => {
      if (this.data.timeRemaining > 0 && this.data.timerRunning) {
        this.setData({ timeRemaining: this.data.timeRemaining - 1 })

        if (this.data.timeRemaining === 0) {
          this.completeSession()
        }
      }
    }, 1000);

    (this.data as any).timerInterval = interval
  },

  onToggleTimer() {
    if (this.data.timerRunning) {
      this.pauseTimer()
    } else {
      this.resumeTimer()
    }
  },

  pauseTimer() {
    this.timerRunning = false
    this.setData({ timerRunning: false })
  },

  resumeTimer() {
    this.timerRunning = true
    this.setData({ timerRunning: true })
  },

  onReset() {
    clearInterval((this.data as any).timerInterval)
    this.setData({
      timeRemaining: 25 * 60,
      timerRunning: false
    })
    this.startTimer()
  },

  completeSession() {
    clearInterval((this.data as any).timerInterval)

    // TODO: Save session to backend
    const session = {
      startTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      duration: this.timerDuration - this.data.timeRemaining,
      taskTitle: this.data.currentTask?.title || '无任务'
    }

    this.setData({
      sessions: [...this.data.sessions, session],
      todayStats: {
        completedCount: this.data.todayStats.completedCount + 1,
        totalTime: this.data.todayStats.totalTime + (this.timerDuration - this.data.timeRemaining),
        sessions: this.data.todayStats.sessions + 1
      },
      timerRunning: false,
      timeRemaining: 25 * 60
    })

    wx.showToast({ title: '专注完成！', icon: 'success' })
  },

  onShowTaskSelector() {
    this.setData({ showTaskSelector: true })
  },

  onTaskConfirm(e: WechatMiniprogram.CustomEvent) {
    const { task } = e.detail
    this.setData({
      currentTask: task,
      showTaskSelector: false
    })
  },

  onTaskCancel() {
    this.setData({ showTaskSelector: false })
  },

  formatTime(): string {
    const minutes = Math.floor(this.data.timeRemaining / 60)
    const seconds = this.data.timeRemaining % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
})
