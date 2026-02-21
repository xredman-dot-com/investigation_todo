import { initPageTheme } from "../../../core/themeMixin"
import { createPomodoroSession, deletePomodoroSession, listPomodoroSessions, updatePomodoroSession } from "../services"
import type { PomodoroSession } from "../model"
import type { TaskItem } from "../../../types/api"
import { pomodoroStore } from "../../../stores/pomodoro"

type FocusMode = "pomodoro" | "countup"
type PomodoroPhase = "focus" | "break"

Page({
  data: {
    sessions: [] as PomodoroSession[],
    viewMode: "pomodoro" as FocusMode,
    timerPhase: "focus" as PomodoroPhase,
    timerRunning: false,
    focusMinutes: 25,
    breakMinutes: 5,
    timeRemaining: 25 * 60,
    elapsedSeconds: 0,
    displayTime: "25:00",
    timerStatusText: "准备开始",
    timerPhaseText: "专注",
    primaryLabel: "开始",
    secondaryLabel: "重置",
    currentSessionId: "",
    currentTask: null as TaskItem | null,
    showTaskSelector: false,
    todayStats: {
      focusCount: 0,
      focusMinutes: 0,
      countupMinutes: 0
    },
    isLoading: false,
    errorMessage: ""
  },
  timerInterval: null as number | null,
  onShow() {
    initPageTheme(this)
    this.applyMenuSelection()
    this.loadSettings()
    this.fetchSessions()
    this.syncTimerDisplay()
    this.updateActionLabels()
  },
  async onPullDownRefresh() {
    await this.fetchSessions(true)
    wx.stopPullDownRefresh()
  },
  onHide() {
    this.stopInterval()
  },
  onUnload() {
    this.stopInterval()
  },
  applyMenuSelection() {
    const selection = wx.getStorageSync("menu:pomodoroMode")
    if (!selection) return
    wx.removeStorageSync("menu:pomodoroMode")
    const mode = selection.mode as FocusMode
    if (mode && mode !== this.data.viewMode) {
      this.resetTimer(true)
      this.setData({ viewMode: mode, timerPhase: "focus" }, () => {
        this.syncTimerDisplay()
        this.updateActionLabels()
      })
    }
  },
  async fetchSessions(forceRefresh = false) {
    const cached = pomodoroStore.getState()
    if (!forceRefresh && cached.sessions.length) {
      const normalized = this.normalizeSessions(cached.sessions)
      this.setData({ sessions: normalized })
      this.updateTodayStats(normalized)
      this.hydrateActiveSession(normalized)
    }
    pomodoroStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const sessions = await listPomodoroSessions()
      const normalized = this.normalizeSessions(sessions)
      pomodoroStore.setState({ sessions: normalized, loading: false, error: null })
      this.setData({ sessions: normalized, isLoading: false, errorMessage: "" })
      this.updateTodayStats(normalized)
      this.hydrateActiveSession(normalized)
    } catch (error) {
      pomodoroStore.setState({
        loading: false,
        error: error instanceof Error ? error.message : "加载失败",
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败"
      })
    }
  },
  loadSettings() {
    const settings = wx.getStorageSync("pomodoroSettings") || {}
    const focusMinutes = settings.focusTime || 25
    const breakMinutes = settings.shortBreak || 5
    const timeRemaining = focusMinutes * 60
    this.setData({
      focusMinutes,
      breakMinutes,
      timeRemaining
    })
  },
  saveSetting(key: string, value: number) {
    const settings = wx.getStorageSync("pomodoroSettings") || {}
    settings[key] = value
    wx.setStorageSync("pomodoroSettings", settings)
  },
  onModeChange(e: WechatMiniprogram.CustomEvent) {
    const mode = e.currentTarget.dataset.mode as FocusMode
    if (mode === this.data.viewMode) return
    this.resetTimer(true)
    this.setData({ viewMode: mode, timerPhase: "focus" }, () => {
      this.syncTimerDisplay()
      this.updateActionLabels()
    })
  },
  onDurationPreset(e: WechatMiniprogram.CustomEvent) {
    const field = e.currentTarget.dataset.field as "focus" | "break"
    const minutes = Number(e.currentTarget.dataset.minutes)
    if (!minutes) return
    if (field === "focus") {
      this.setData({
        focusMinutes: minutes,
        timeRemaining: minutes * 60,
        timerPhase: "focus"
      })
      this.saveSetting("focusTime", minutes)
    } else {
      this.setData({ breakMinutes: minutes })
      this.saveSetting("shortBreak", minutes)
    }
    this.syncTimerDisplay()
    this.updateActionLabels()
  },
  onPrimaryAction() {
    if (this.data.timerRunning) {
      this.pauseTimer()
      return
    }
    this.startTimer()
  },
  onSecondaryAction() {
    if (this.data.currentSessionId) {
      this.endSession()
      return
    }
    this.resetTimer(false)
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
  async startTimer() {
    if (this.data.viewMode === "pomodoro") {
      if (this.data.timerPhase === "focus" && !this.data.currentSessionId) {
        await this.createFocusSession()
      }
      if (this.data.timeRemaining <= 0) {
        const resetSeconds = this.data.timerPhase === "break"
          ? this.data.breakMinutes * 60
          : this.data.focusMinutes * 60
        this.setData({ timeRemaining: resetSeconds })
      }
    } else {
      if (!this.data.currentSessionId && this.data.elapsedSeconds === 0) {
        await this.createCountupSession()
      }
    }
    this.setTimerRunning(true)
  },
  pauseTimer() {
    this.setTimerRunning(false)
  },
  async endSession() {
    if (!this.data.currentSessionId) return
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const completedAt = new Date().toISOString()
      if (this.data.viewMode === "pomodoro" && this.data.timerPhase === "focus") {
        const elapsedSeconds = this.data.focusMinutes * 60 - this.data.timeRemaining
        const actualMinutes = this.formatMinutes(elapsedSeconds)
        await updatePomodoroSession(this.data.currentSessionId, {
          status: "completed",
          completed_at: completedAt,
          duration: actualMinutes,
          actual_duration: actualMinutes
        })
      } else if (this.data.viewMode === "countup") {
        const actualMinutes = this.formatMinutes(this.data.elapsedSeconds)
        await updatePomodoroSession(this.data.currentSessionId, {
          status: "completed",
          completed_at: completedAt,
          duration: actualMinutes,
          actual_duration: actualMinutes
        })
      }
      this.setData({ currentSessionId: "" })
      pomodoroStore.setState({ activeSessionId: null })
      await this.fetchSessions(true)
    } catch (error) {
      pomodoroStore.setState({
        error: error instanceof Error ? error.message : "更新失败"
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "更新失败"
      })
    } finally {
      this.resetTimer(false)
    }
  },
  async createFocusSession() {
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const session = await createPomodoroSession({
        duration: this.data.focusMinutes,
        break_duration: this.data.breakMinutes,
        type: "focus",
        status: "running",
        started_at: new Date().toISOString(),
        task_id: this.data.currentTask?.id || null
      })
      this.setData({ currentSessionId: session.id })
      pomodoroStore.setState({ activeSessionId: session.id })
      this.setData({ isLoading: false })
    } catch (error) {
      pomodoroStore.setState({
        error: error instanceof Error ? error.message : "创建失败"
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "创建失败"
      })
    }
  },
  async createCountupSession() {
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const session = await createPomodoroSession({
        duration: 0,
        break_duration: 0,
        type: "countup",
        status: "running",
        started_at: new Date().toISOString(),
        task_id: this.data.currentTask?.id || null
      })
      this.setData({ currentSessionId: session.id })
      pomodoroStore.setState({ activeSessionId: session.id })
      this.setData({ isLoading: false })
    } catch (error) {
      pomodoroStore.setState({
        error: error instanceof Error ? error.message : "创建失败"
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "创建失败"
      })
    }
  },
  async cancelSession() {
    if (!this.data.currentSessionId) return
    try {
      await deletePomodoroSession(this.data.currentSessionId)
    } catch (error) {
      console.error("Failed to cancel session:", error)
    } finally {
      pomodoroStore.setState({ activeSessionId: null })
      this.setData({ currentSessionId: "" })
    }
  },
  resetTimer(cancelActive: boolean) {
    this.setTimerRunning(false)
    if (cancelActive) {
      void this.cancelSession()
    }
    this.setData({
      timerPhase: "focus",
      timeRemaining: this.data.focusMinutes * 60,
      elapsedSeconds: 0
    })
    this.syncTimerDisplay()
    this.updateActionLabels()
  },
  setTimerRunning(running: boolean) {
    this.setData({ timerRunning: running }, () => {
      if (running) {
        this.startInterval()
      } else {
        this.stopInterval()
      }
      this.syncTimerDisplay()
      this.updateActionLabels()
    })
  },
  startInterval() {
    if (this.timerInterval) return
    this.timerInterval = setInterval(() => {
      if (!this.data.timerRunning) return
      if (this.data.viewMode === "pomodoro") {
        if (this.data.timeRemaining > 0) {
          this.setData({ timeRemaining: this.data.timeRemaining - 1 }, () => {
            this.syncTimerDisplay()
          })
        } else {
          this.onPomodoroPhaseComplete()
        }
      } else {
        this.setData({ elapsedSeconds: this.data.elapsedSeconds + 1 }, () => {
          this.syncTimerDisplay()
        })
      }
    }, 1000)
  },
  stopInterval() {
    if (!this.timerInterval) return
    clearInterval(this.timerInterval)
    this.timerInterval = null
  },
  async onPomodoroPhaseComplete() {
    this.setTimerRunning(false)
    if (this.data.timerPhase === "focus") {
      await this.endSession()
      wx.showToast({ title: "专注完成", icon: "success" })
      if (this.data.breakMinutes > 0) {
        this.setData({
          timerPhase: "break",
          timeRemaining: this.data.breakMinutes * 60
        })
        this.syncTimerDisplay()
        this.updateActionLabels()
      }
    } else {
      this.setData({
        timerPhase: "focus",
        timeRemaining: this.data.focusMinutes * 60
      })
      this.syncTimerDisplay()
      this.updateActionLabels()
    }
  },
  syncTimerDisplay() {
    let displayTime = "00:00"
    let statusText = "准备开始"
    let phaseText = "专注"

    if (this.data.viewMode === "pomodoro") {
      displayTime = this.formatCountdown(this.data.timeRemaining)
      phaseText = this.data.timerPhase === "focus" ? "专注" : "休息"
      if (this.data.timerRunning) {
        statusText = this.data.timerPhase === "focus" ? "专注中" : "休息中"
      } else {
        statusText = this.data.timerPhase === "focus" ? "准备专注" : "准备休息"
      }
    } else {
      displayTime = this.formatCountup(this.data.elapsedSeconds)
      phaseText = "正计时"
      statusText = this.data.timerRunning ? "计时中" : "已暂停"
    }

    this.setData({
      displayTime,
      timerStatusText: statusText,
      timerPhaseText: phaseText
    })
  },
  updateActionLabels() {
    const hasSession = Boolean(this.data.currentSessionId)
    const primaryLabel = this.data.timerRunning ? "暂停" : hasSession ? "继续" : "开始"
    let secondaryLabel = "重置"
    if (hasSession) {
      secondaryLabel = "结束"
    } else if (this.data.viewMode === "countup") {
      secondaryLabel = "清零"
    }
    this.setData({ primaryLabel, secondaryLabel })
  },
  normalizeSessions(sessions: PomodoroSession[]) {
    return sessions.map((session) => {
      const startedAt = session.started_at ? new Date(session.started_at) : null
      const displayTime = startedAt
        ? `${String(startedAt.getHours()).padStart(2, "0")}:${String(startedAt.getMinutes()).padStart(2, "0")}`
        : ""
      const typeText = session.type === "focus" ? "番茄计时" : "正计时"
      const statusText = session.status === "completed"
        ? "已完成"
        : session.status === "running"
          ? "进行中"
          : session.status === "paused"
            ? "已暂停"
            : "已结束"
      return {
        ...session,
        displayTime,
        typeText,
        statusText
      }
    })
  },
  hydrateActiveSession(sessions: PomodoroSession[]) {
    const active = sessions.find((session) => session.status === "running")
    if (!active || !active.started_at) return
    const startedAtMs = new Date(active.started_at).getTime()
    if (!startedAtMs) return

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000))

    if (active.type === "focus") {
      const focusMinutes = active.duration || this.data.focusMinutes
      const breakMinutes = active.break_duration ?? this.data.breakMinutes
      const totalSeconds = focusMinutes * 60
      const remaining = Math.max(0, totalSeconds - elapsedSeconds)
      const shouldRun = remaining > 0
      this.setData({
        viewMode: "pomodoro",
        timerPhase: "focus",
        focusMinutes,
        breakMinutes,
        timeRemaining: remaining,
        elapsedSeconds: 0,
        currentSessionId: active.id,
        timerRunning: false
      }, () => {
        if (shouldRun) {
          this.setTimerRunning(true)
        } else {
          this.syncTimerDisplay()
          this.updateActionLabels()
        }
      })
      return
    }

    this.setData({
      viewMode: "countup",
      timerPhase: "focus",
      elapsedSeconds,
      timeRemaining: this.data.focusMinutes * 60,
      currentSessionId: active.id,
      timerRunning: false
    }, () => {
      this.setTimerRunning(true)
    })
  },
  updateTodayStats(sessions: PomodoroSession[]) {
    const today = new Date().toISOString().slice(0, 10)
    const todaySessions = sessions.filter((session) => session.started_at?.startsWith(today))
    const focusSessions = todaySessions.filter((session) => session.type === "focus")
    const countupSessions = todaySessions.filter((session) => session.type === "countup")
    const focusMinutes = focusSessions.reduce((sum, session) => sum + (session.actual_duration ?? session.duration), 0)
    const countupMinutes = countupSessions.reduce((sum, session) => sum + (session.actual_duration ?? session.duration), 0)
    this.setData({
      todayStats: {
        focusCount: focusSessions.length,
        focusMinutes,
        countupMinutes
      }
    })
  },
  formatCountdown(seconds: number): string {
    const minutes = Math.max(0, Math.floor(seconds / 60))
    const remainingSeconds = Math.max(0, seconds % 60)
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  },
  formatCountup(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  },
  formatMinutes(seconds: number): number {
    if (seconds <= 0) return 0
    return Math.max(1, Math.round(seconds / 60))
  }
})
