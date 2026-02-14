import { initPageTheme } from "../../../core/themeMixin"
import { dailyStats } from "../services"
import type { DailyStat } from "../model"
import { statisticsStore } from "../../../stores/statistics"

function formatDate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

Page({
  data: {
    startDate: "",
    endDate: "",
    stats: [] as DailyStat[],
    isLoading: false,
    errorMessage: ""
  },
  onLoad() {
    initPageTheme(this)
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - 7)
    this.setData({ startDate: formatDate(start), endDate: formatDate(today) })
    this.fetchStats()
  },
  async onPullDownRefresh() {
    await this.fetchStats(true)
    wx.stopPullDownRefresh()
  },
  onStartDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ startDate: event.detail.value })
  },
  onEndDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ endDate: event.detail.value })
  },
  async fetchStats(forceRefresh = false) {
    const cached = statisticsStore.getState()
    if (!forceRefresh && cached.stats.length) {
      this.setData({ stats: cached.stats })
    }
    statisticsStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const stats = await dailyStats(this.data.startDate, this.data.endDate)
      statisticsStore.setState({ stats, loading: false, error: null })
      this.setData({ stats, isLoading: false, errorMessage: "" })
    } catch (error) {
      statisticsStore.setState({
        loading: false,
        error: error instanceof Error ? error.message : "加载失败"
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败"
      })
    }
  }
})
