import { createHabit, createHabitLog, deleteHabit, listHabitLogs, listHabits } from "../services"
import type { HabitItem, HabitLogItem } from "../model"
import { habitsStore } from "../../../stores/habits"
import { initPageTheme } from "../../../core/themeMixin"

function formatDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

Page({
  data: {
    habits: [] as HabitItem[],
    logs: [] as HabitLogItem[],
    activeHabitId: "",
    isLoading: false,
    errorMessage: "",
    form: {
      name: "",
      target_count: ""
    }
  },
  onShow() {
    // 初始化主题
    initPageTheme(this)
    this.fetchHabits()
  },
  async onPullDownRefresh() {
    await this.fetchHabits(true)
    wx.stopPullDownRefresh()
  },
  async fetchHabits(forceRefresh = false) {
    const cached = habitsStore.getState()
    if (!forceRefresh && cached.habits.length) {
      this.setData({ habits: cached.habits, logs: cached.logs, activeHabitId: cached.activeHabitId || "" })
    }
    habitsStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const habits = await listHabits()
      habitsStore.setState({ habits, loading: false, error: null })
      this.setData({ habits, isLoading: false, errorMessage: "" })
    } catch (error) {
      habitsStore.setState({
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
    this.setData({ [`form.${field}`]: event.detail.value })
  },
  async addHabit() {
    if (!this.data.form.name) {
      wx.showToast({ title: "请输入名称", icon: "none" })
      return
    }
    await createHabit({
      name: this.data.form.name,
      target_count: this.data.form.target_count ? Number(this.data.form.target_count) : 1
    })
    this.setData({ form: { name: "", target_count: "" } })
    await this.fetchHabits(true)
  },
  async removeHabit(event: WechatMiniprogram.TouchEvent) {
    const habitId = event.currentTarget.dataset.id as string
    await deleteHabit(habitId)
    await this.fetchHabits(true)
  },
  async checkInHabit(event: WechatMiniprogram.TouchEvent) {
    const habitId = event.currentTarget.dataset.id as string
    const today = formatDate(new Date())
    await createHabitLog(habitId, { completed_at: today, count: 1 })
    await this.fetchHabits(true)
  },
  async showLogs(event: WechatMiniprogram.TouchEvent) {
    const habitId = event.currentTarget.dataset.id as string
    const logs = await listHabitLogs(habitId)
    this.setData({ logs, activeHabitId: habitId })
    habitsStore.setState({ logs, activeHabitId: habitId })
  }
})
