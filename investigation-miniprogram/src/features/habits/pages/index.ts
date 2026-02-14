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
    activeHabitName: "",
    isLoading: false,
    errorMessage: "",
    summary: {
      total: 0,
      totalCompleted: 0,
      maxStreak: 0
    },
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
      const normalized = this.normalizeHabits(cached.habits)
      this.setData({
        habits: normalized,
        logs: cached.logs,
        activeHabitId: cached.activeHabitId || "",
        summary: this.buildSummary(cached.habits)
      })
    }
    habitsStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const habits = await listHabits()
      const normalized = this.normalizeHabits(habits)
      habitsStore.setState({ habits: normalized, loading: false, error: null })
      this.setData({
        habits: normalized,
        summary: this.buildSummary(habits),
        isLoading: false,
        errorMessage: ""
      })
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
    const activeHabit = this.data.habits.find((habit) => habit.id === habitId)
    this.setData({
      logs,
      activeHabitId: habitId,
      activeHabitName: activeHabit ? activeHabit.name : ""
    })
    habitsStore.setState({ logs, activeHabitId: habitId })
  },
  buildSummary(habits: HabitItem[]) {
    const total = habits.length
    const totalCompleted = habits.reduce((sum, habit) => sum + (habit.total_completed || 0), 0)
    const maxStreak = habits.reduce((max, habit) => Math.max(max, habit.longest_streak || 0), 0)
    return { total, totalCompleted, maxStreak }
  },
  normalizeHabits(habits: HabitItem[]) {
    return habits.map((habit) => ({
      ...habit,
      targetText: `目标 ${habit.target_count || 1}/天`,
      reminderText: habit.reminder_time ? `提醒 ${habit.reminder_time}` : "未设置提醒",
      toneClass: habit.is_positive ? "positive" : "negative"
    }))
  }
})
