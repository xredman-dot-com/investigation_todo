import { createPomodoroSession, listPomodoroSessions, updatePomodoroSession } from "../services"
import type { PomodoroSession } from "../model"
import { pomodoroStore } from "../../../stores/pomodoro"

Page({
  data: {
    sessions: [] as PomodoroSession[],
    duration: "25",
    breakDuration: "5",
    currentSessionId: "",
    isLoading: false,
    errorMessage: ""
  },
  onShow() {
    this.fetchSessions()
  },
  async onPullDownRefresh() {
    await this.fetchSessions(true)
    wx.stopPullDownRefresh()
  },
  async fetchSessions(forceRefresh = false) {
    const cached = pomodoroStore.getState()
    if (!forceRefresh && cached.sessions.length) {
      this.setData({ sessions: cached.sessions })
    }
    pomodoroStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const sessions = await listPomodoroSessions()
      pomodoroStore.setState({ sessions, loading: false, error: null })
      this.setData({ sessions, isLoading: false, errorMessage: "" })
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
  onInputChange(event: WechatMiniprogram.Input) {
    const field = event.currentTarget.dataset.field as string
    this.setData({ [field]: event.detail.value })
  },
  async startSession() {
    const duration = Number(this.data.duration || 25)
    const breakDuration = Number(this.data.breakDuration || 5)
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const session = await createPomodoroSession({ duration, break_duration: breakDuration, type: "focus", status: "running" })
      this.setData({ currentSessionId: session.id })
      await this.fetchSessions(true)
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
  async completeSession() {
    if (!this.data.currentSessionId) {
      wx.showToast({ title: "无进行中的番茄", icon: "none" })
      return
    }
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      await updatePomodoroSession(this.data.currentSessionId, { status: "completed", completed_at: new Date().toISOString() })
      this.setData({ currentSessionId: "" })
      await this.fetchSessions(true)
    } catch (error) {
      pomodoroStore.setState({
        error: error instanceof Error ? error.message : "更新失败"
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "更新失败"
      })
    }
  }
})
