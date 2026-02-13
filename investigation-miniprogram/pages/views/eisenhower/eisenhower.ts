import { eisenhowerView } from "../../../utils/api/views"
import type { EisenhowerView } from "../../../utils/api/types"

Page({
  data: {
    view: null as EisenhowerView | null,
    loading: false
  },
  onShow() {
    this.fetchView()
  },
  async onPullDownRefresh() {
    await this.fetchView()
    wx.stopPullDownRefresh()
  },
  async fetchView() {
    this.setData({ loading: true })
    try {
      const view = await eisenhowerView()
      this.setData({ view })
    } finally {
      this.setData({ loading: false })
    }
  }
})
