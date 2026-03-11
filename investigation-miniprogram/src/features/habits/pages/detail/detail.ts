import { createHabitLog, deleteHabit, getHabit, listHabitLogs } from "../../services"
import type { HabitItem, HabitLogItem } from "../../model"
import { initPageTheme } from "../../../../core/themeMixin"

function formatDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatMonthDay(value: string): string {
  return value.slice(5)
}

Page({
  data: {
    habitId: "",
    habit: null as HabitItem | null,
    monthlyData: [] as Array<{ day: number; checked: boolean }>,
    recentRecords: [] as Array<{ id: string; date: string; count: number; checked: boolean }>,
    todayChecked: false,
    isLoading: false,
    frequencyLabels: {
      daily: "每天",
      weekly: "每周",
      monthly: "每月"
    } as Record<string, string>
  },

  onLoad(options: Record<string, string>) {
    initPageTheme(this)
    const { id } = options
    if (!id) {
      wx.showToast({ title: "参数错误", icon: "none" })
      wx.navigateBack()
      return
    }

    this.setData({ habitId: id })
  },

  onShow() {
    if (this.data.habitId) {
      this.loadHabit()
    }
  },

  async loadHabit() {
    this.setData({ isLoading: true })
    try {
      const habit = await getHabit(this.data.habitId)
      const logs = await listHabitLogs(this.data.habitId)
      const today = formatDate(new Date())

      this.setData({
        habit,
        monthlyData: this.buildMonthlyData(logs),
        recentRecords: logs.slice(0, 10).map((log) => ({
          id: log.id,
          date: formatMonthDay(log.completed_at),
          count: log.count,
          checked: log.count > 0
        })),
        todayChecked: logs.some((log) => log.completed_at === today && log.count > 0),
        isLoading: false
      })

      wx.setNavigationBarTitle({ title: habit.name })
    } catch (error) {
      this.setData({ isLoading: false })
      wx.showToast({ title: "加载失败", icon: "none" })
    }
  },

  buildMonthlyData(logs: HabitLogItem[]) {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`
    const checkedSet = new Set(
      logs
        .filter((log) => log.completed_at.startsWith(monthPrefix) && log.count > 0)
        .map((log) => Number(log.completed_at.slice(-2)))
    )

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1
      return { day, checked: checkedSet.has(day) }
    })
  },

  async onCheckIn() {
    if (this.data.todayChecked) {
      wx.showToast({ title: "今日已打卡", icon: "none" })
      return
    }

    try {
      await createHabitLog(this.data.habitId, { completed_at: formatDate(new Date()), count: 1 })
      wx.showToast({ title: "打卡成功", icon: "success" })
      await this.loadHabit()
    } catch (error) {
      wx.showToast({ title: "打卡失败", icon: "none" })
    }
  },

  onEdit() {
    wx.showToast({ title: "编辑功能开发中", icon: "none" })
  },

  onDelete() {
    const habit = this.data.habit
    if (!habit) return

    wx.showModal({
      title: "确认删除",
      content: `删除习惯「${habit.name}」？`,
      confirmColor: "#ff4d4f",
      success: async (res) => {
        if (!res.confirm) return
        try {
          await deleteHabit(habit.id)
          wx.showToast({ title: "已删除", icon: "success" })
          setTimeout(() => wx.navigateBack(), 300)
        } catch (error) {
          wx.showToast({ title: "删除失败", icon: "none" })
        }
      }
    })
  },

  onBack() {
    wx.navigateBack()
  }
})
