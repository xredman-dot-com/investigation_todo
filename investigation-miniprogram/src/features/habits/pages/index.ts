import { createHabit, createHabitLog, listHabitLogs, listHabits } from "../services"
import type { HabitItem } from "../model"
import { habitsStore } from "../../../stores/habits"
import { initPageTheme } from "../../../core/themeMixin"

type HabitCard = HabitItem & {
  todayCount: number
  remainingCount: number
  completedToday: boolean
  statusText: string
}

function formatDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

Page({
  data: {
    pendingHabits: [] as HabitCard[],
    completedHabits: [] as HabitCard[],
    isLoading: false,
    errorMessage: "",
    showCreateModal: false,
    showCompleted: false,
    progress: {
      completed: 0,
      total: 0,
      summary: "今天先完成一个。"
    }
  },

  onShow() {
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
      await this.applyHabits(cached.habits)
    }

    this.setData({ isLoading: true, errorMessage: "" })
    habitsStore.setState({ loading: true, error: null })

    try {
      const habits = await listHabits()
      habitsStore.setState({ habits, loading: false, error: null })
      await this.applyHabits(habits)
      this.setData({ isLoading: false, errorMessage: "" })
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载失败"
      habitsStore.setState({ loading: false, error: message })
      this.setData({ isLoading: false, errorMessage: message })
    }
  },

  async applyHabits(habits: HabitItem[]) {
    const today = formatDate(new Date())
    const dailyLogs = await Promise.all(
      habits.map(async (habit) => {
        try {
          const logs = await listHabitLogs(habit.id, today, today)
          return {
            habitId: habit.id,
            count: logs.reduce((sum, log) => sum + (log.count || 0), 0)
          }
        } catch (error) {
          return { habitId: habit.id, count: 0 }
        }
      })
    )

    const countMap = dailyLogs.reduce<Record<string, number>>((acc, item) => {
      acc[item.habitId] = item.count
      return acc
    }, {})

    const cards = habits
      .map((habit) => this.toHabitCard(habit, countMap[habit.id] || 0))
      .sort((left, right) => {
        if (left.completedToday !== right.completedToday) {
          return left.completedToday ? 1 : -1
        }
        return right.current_streak - left.current_streak
      })

    this.setData({
      pendingHabits: cards.filter((habit) => !habit.completedToday),
      completedHabits: cards.filter((habit) => habit.completedToday),
      progress: this.buildProgress(cards)
    })
  },

  toHabitCard(habit: HabitItem, todayCount: number): HabitCard {
    const target = Math.max(habit.target_count || 1, 1)
    const completedToday = todayCount >= target
    const remainingCount = Math.max(target - todayCount, 0)

    let statusText = `今天 ${Math.min(todayCount, target)}/${target}`
    if (completedToday) {
      statusText = `今日已完成 · 连续 ${habit.current_streak || 0} 天`
    } else if (todayCount > 0) {
      statusText = `还差 ${remainingCount} 次 · 今天 ${todayCount}/${target}`
    } else if ((habit.current_streak || 0) > 0) {
      statusText = `连续 ${habit.current_streak} 天`
    }

    return {
      ...habit,
      todayCount,
      remainingCount,
      completedToday,
      statusText
    }
  },

  buildProgress(habits: HabitCard[]) {
    const total = habits.length
    const completed = habits.filter((habit) => habit.completedToday).length
    let summary = "今天先完成一个。"

    if (total === 0) {
      summary = "还没有习惯"
    } else if (completed === total) {
      summary = "今天已全部完成"
    } else if (completed > 0) {
      summary = `还差 ${total - completed} 个`
    }

    return { completed, total, summary }
  },

  async onCheckIn(event: WechatMiniprogram.TouchEvent) {
    const habitId = event.currentTarget.dataset.id as string
    const today = formatDate(new Date())
    try {
      await createHabitLog(habitId, { completed_at: today, count: 1 })
      wx.showToast({ title: "打卡成功", icon: "success" })
      await this.fetchHabits(true)
    } catch (error) {
      wx.showToast({ title: "打卡失败", icon: "none" })
    }
  },

  onOpenCreate() {
    this.setData({ showCreateModal: true })
  },

  onCloseCreate() {
    this.setData({ showCreateModal: false })
  },

  async onCreateHabit(event: WechatMiniprogram.CustomEvent) {
    const habit = event.detail.habit as {
      name: string
      frequency: string
      target_count: number
      reminder_time?: string
    }

    try {
      await createHabit({
        name: habit.name,
        frequency: habit.frequency,
        target_count: habit.target_count,
        reminder_enabled: Boolean(habit.reminder_time),
        reminder_time: habit.reminder_time || null
      })
      this.setData({ showCreateModal: false })
      wx.showToast({ title: "创建成功", icon: "success" })
      await this.fetchHabits(true)
    } catch (error) {
      wx.showToast({ title: "创建失败", icon: "none" })
    }
  },

  onToggleCompleted() {
    this.setData({ showCompleted: !this.data.showCompleted })
  },

  onGoDetail(event: WechatMiniprogram.TouchEvent) {
    const habitId = event.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/features/habits/pages/detail/detail?id=${habitId}` })
  }
})
