import { initPageTheme } from "../../../../core/themeMixin"
import { timelineView } from "../../services"
import type { TimelineBucket } from "../../model"
import { viewsStore } from "../../../../stores/views"

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
    buckets: [] as TimelineBucket[],
    isLoading: false,
    errorMessage: ""
  },
  onLoad() {
    initPageTheme(this)
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - 7)
    this.setData({ startDate: formatDate(start), endDate: formatDate(today) })
    this.fetchTimeline()
  },
  async onPullDownRefresh() {
    await this.fetchTimeline(true)
    wx.stopPullDownRefresh()
  },
  onStartDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ startDate: event.detail.value })
  },
  onEndDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ endDate: event.detail.value })
  },
  async fetchTimeline(forceRefresh = false) {
    const cached = viewsStore.getState()
    if (!forceRefresh && cached.timeline.length) {
      this.setData({ buckets: cached.timeline })
    }
    viewsStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const buckets = await timelineView({
        start_date: this.data.startDate || undefined,
        end_date: this.data.endDate || undefined
      })
      viewsStore.setState({ timeline: buckets, loading: false, error: null })
      this.setData({ buckets, isLoading: false, errorMessage: "" })
    } catch (error) {
      viewsStore.setState({
        loading: false,
        error: error instanceof Error ? error.message : "加载失败"
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败"
      })
    } finally {
      this.setData({ isLoading: false })
    }
  }
})
