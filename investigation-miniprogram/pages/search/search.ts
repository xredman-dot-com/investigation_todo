// pages/search/search.ts
import { listTasks, listLists } from '../../../utils/api/tasks'

Page({
  data: {
    searchText: '',
    filterType: 'all',
    searchHistory: [] as string[],
    taskResults: [] as any[],
    listResults: [] as any[],
    tagResults: [] as string[]
  },

  onLoad() {
    this.loadSearchHistory()
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({ searchHistory: history.slice(0, 10) }) // 最多显示10条
  },

  onSearchInput(e: WechatMiniprogram.Input) {
    this.setData({ searchText: e.detail.value })

    if (e.detail.value.trim()) {
      this.performSearch(e.detail.value)
    } else {
      this.clearResults()
    }
  },

  async performSearch(query: string) {
    const searchText = query.toLowerCase().trim()

    try {
      // TODO: 从后端搜索任务
      const allTasks = await listTasks()
      const taskResults = allTasks.filter((task: any) =>
        task.title && task.title.toLowerCase().includes(searchText)
      )

      // TODO: 从后端搜索清单
      const allLists = await listLists()
      const listResults = allLists.filter((list: any) =>
        list.name && list.name.toLowerCase().includes(searchText)
      )

      // TODO: 从后端搜索标签
      const tagResults = ['工作', '个人', '学习', '健康'].filter(tag =>
        tag.toLowerCase().includes(searchText)
      )

      this.setData({
        taskResults,
        listResults,
        tagResults
      })
    } catch (error) {
      console.error('Search failed:', error)
      wx.showToast({ title: '搜索失败', icon: 'none' })
    }
  },

  onSearch() {
    if (!this.data.searchText.trim()) return

    // 添加到搜索历史
    let history = wx.getStorageSync('searchHistory') || []
    history = history.filter((h: string) => h !== this.data.searchText)
    history.unshift(this.data.searchText)
    history = history.slice(0, 20) // 最多保存20条

    wx.setStorageSync('searchHistory', history)
    this.setData({ searchHistory: history.slice(0, 10) })
  },

  onFilterChange(e: WechatMiniprogram.CustomEvent) {
    const { type } = e.currentTarget.dataset
    this.setData({ filterType: type })
  },

  onClear() {
    this.setData({
      searchText: '',
      filterType: 'all'
    })
    this.clearResults()
  },

  clearResults() {
    this.setData({
      taskResults: [],
      listResults: [],
      tagResults: []
    })
  },

  onTaskToggle(e: WechatMiniprogram.CustomEvent) {
    console.log('Toggle task:', e.detail)
    // TODO: Toggle task status
  },

  onTaskDetail(e: WechatMiniprogram.CustomEvent) {
    const { task } = e.detail
    wx.navigateTo({
      url: `/pages/tasks/detail/detail?id=${task.id}`
    })
  },

  onSelectList(e: WechatMiniprogram.CustomEvent) {
    const { list } = e.currentTarget.dataset
    wx.switchTab({
      url: '/pages/tasks/list/list'
    })
    // TODO: 切换到该清单
  },

  onSelectTag(e: WechatMiniprogram.CustomEvent) {
    const { tag } = e.currentTarget.dataset
    this.setData({
      searchText: '#' + tag,
      filterType: 'tags'
    })
    this.performSearch(tag)
  },

  onHistoryClick(e: WechatMiniprogram.CustomEvent) {
    const { query } = e.currentTarget.dataset
    this.setData({ searchText: query })
    this.performSearch(query)
  },

  onClearHistory() {
    wx.showModal({
      title: '清除搜索历史',
      content: '确定要清除所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({ searchHistory: [] })
          wx.showToast({ title: '已清除', icon: 'success' })
        }
      }
    })
  }
})
