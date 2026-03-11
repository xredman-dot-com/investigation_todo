import { listHabits, createHabitLog, createHabit, deleteHabit } from "../../services"
import type { HabitItem } from "../../model"
import { habitsStore } from "../../../../stores/habits"
import { initPageTheme } from "../../../../core/themeMixin"

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

Page({
  data: {
    habits: [] as HabitItem[],
    isLoading: false,
    showForm: false,
    formName: "",
    formTarget: "1"
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
      this.setData({
        habits: this.processHabits(cached.habits)
      })
    }
    this.setData({ isLoading: true })
    try {
      const habits = await listHabits()
      habitsStore.setState({ habits, loading: false, error: null })
      this.setData({
        habits: this.processHabits(habits),
        isLoading: false
      })
    } catch (error) {
      this.setData({ isLoading: false })
      wx.showToast({ title: "加载失败", icon: "none" })
    }
  },

  processHabits(habits: HabitItem[]) {
    return habits
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

  onShowForm() {
    this.setData({ showForm: true, formName: "", formTarget: "1" })
  },

  onCloseForm() {
    this.setData({ showForm: false })
  },

  onFormNameChange(e: WechatMiniprogram.Input) {
    this.setData({ formName: e.detail.value })
  },

  onFormTargetChange(e: WechatMiniprogram.Input) {
    this.setData({ formTarget: e.detail.value })
  },

  async onSubmitForm() {
    const { formName, formTarget } = this.data
    if (!formName.trim()) {
      wx.showToast({ title: "请输入习惯名称", icon: "none" })
      return
    }
    try {
      await createHabit({
        name: formName.trim(),
        target_count: Number(formTarget) || 1
      })
      this.setData({ showForm: false })
      wx.showToast({ title: "添加成功", icon: "success" })
      await this.fetchHabits(true)
    } catch (error) {
      wx.showToast({ title: "添加失败", icon: "none" })
    }
  },

  onGoDetail(event: WechatMiniprogram.TouchEvent) {
    const habitId = event.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/features/habits/pages/detail/detail?id=${habitId}` })
  },

  async onDelete(event: WechatMiniprogram.TouchEvent) {
    const habitId = event.currentTarget.dataset.id as string
    const habitName = event.currentTarget.dataset.name as string
    wx.showModal({
      title: "确认删除",
      content: `删除习惯「${habitName}」？`,
      confirmColor: "#ff4d4f",
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteHabit(habitId)
            wx.showToast({ title: "已删除", icon: "success" })
            await this.fetchHabits(true)
          } catch (error) {
            wx.showToast({ title: "删除失败", icon: "none" })
          }
        }
      }
    })
  }
})
