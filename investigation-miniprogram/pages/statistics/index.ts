import { dailyStats } from "../../utils/api/statistics"
import type { DailyStat } from "../../utils/api/types"

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
    stats: [] as DailyStat[]
  },
  onLoad() {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - 7)
    this.setData({ startDate: formatDate(start), endDate: formatDate(today) })
    this.fetchStats()
  },
  async onPullDownRefresh() {
    await this.fetchStats()
    wx.stopPullDownRefresh()
  },
  onStartDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ startDate: event.detail.value })
  },
  onEndDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ endDate: event.detail.value })
  },
  async fetchStats() {
    const stats = await dailyStats(this.data.startDate, this.data.endDate)
    this.setData({ stats })
  }
})
