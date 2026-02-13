import { createPomodoroSession, listPomodoroSessions, updatePomodoroSession } from "../../utils/api/pomodoro"
import type { PomodoroSession } from "../../utils/api/types"

Page({
  data: {
    sessions: [] as PomodoroSession[],
    duration: "25",
    breakDuration: "5",
    currentSessionId: ""
  },
  onShow() {
    this.fetchSessions()
  },
  async onPullDownRefresh() {
    await this.fetchSessions()
    wx.stopPullDownRefresh()
  },
  async fetchSessions() {
    const sessions = await listPomodoroSessions()
    this.setData({ sessions })
  },
  onInputChange(event: WechatMiniprogram.Input) {
    const field = event.currentTarget.dataset.field as string
    this.setData({ [field]: event.detail.value })
  },
  async startSession() {
    const duration = Number(this.data.duration || 25)
    const breakDuration = Number(this.data.breakDuration || 5)
    const session = await createPomodoroSession({ duration, break_duration: breakDuration, type: "focus", status: "running" })
    this.setData({ currentSessionId: session.id })
    await this.fetchSessions()
  },
  async completeSession() {
    if (!this.data.currentSessionId) {
      wx.showToast({ title: "无进行中的番茄", icon: "none" })
      return
    }
    await updatePomodoroSession(this.data.currentSessionId, { status: "completed", completed_at: new Date().toISOString() })
    this.setData({ currentSessionId: "" })
    await this.fetchSessions()
  }
})
