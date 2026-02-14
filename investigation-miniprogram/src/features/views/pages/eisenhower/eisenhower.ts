import { initPageTheme } from "../../../../core/themeMixin"
import { eisenhowerView } from "../../services"
import type { EisenhowerView } from "../../model"
import { viewsStore } from "../../../../stores/views"

Page({
  data: {
    view: null as EisenhowerView | null,
    isLoading: false,
    errorMessage: ""
  },
  onShow() {
    initPageTheme(this)
    this.fetchView()
  },
  async onPullDownRefresh() {
    await this.fetchView(true)
    wx.stopPullDownRefresh()
  },
  async fetchView(forceRefresh = false) {
    const cached = viewsStore.getState()
    if (!forceRefresh && cached.eisenhower) {
      this.setData({ view: cached.eisenhower })
    }
    viewsStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const view = await eisenhowerView()
      viewsStore.setState({ eisenhower: view, loading: false, error: null })
      this.setData({ view, isLoading: false, errorMessage: "" })
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
