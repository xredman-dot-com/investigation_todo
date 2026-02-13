import { widgetSummary } from "../../api/widgets"
import type { WidgetSummary } from "../../api/types"

Page({
  data: {
    summary: null as WidgetSummary | null,
    loading: false,
    quickActions: [
      { label: "任务清单", url: "/pages/tasks/list" },
      { label: "时间线", url: "/pages/views/timeline" },
      { label: "四象限", url: "/pages/views/eisenhower" },
      { label: "筛选器", url: "/pages/filters/index" },
      { label: "习惯", url: "/pages/habits/index" },
      { label: "番茄钟", url: "/pages/pomodoro/index" },
      { label: "统计", url: "/pages/statistics/index" },
      { label: "设置", url: "/pages/settings/index" }
    ]
  },
  onShow() {
    this.fetchSummary()
  },
  async onPullDownRefresh() {
    await this.fetchSummary()
    wx.stopPullDownRefresh()
  },
  async fetchSummary() {
    this.setData({ loading: true })
    try {
      const summary = await widgetSummary(5)
      this.setData({ summary })
    } finally {
      this.setData({ loading: false })
    }
  },
  goTo(event: WechatMiniprogram.TouchEvent) {
    const url = event.currentTarget.dataset.url as string
    if (url) {
      wx.navigateTo({ url })
    }
  }
})
