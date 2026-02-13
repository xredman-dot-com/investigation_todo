import { listLists } from "../../../api/lists"
import { listTasks, updateTask } from "../../../api/tasks"
import { smartList } from "../../../api/views"
import type { ListItem, TaskItem } from "../../../api/types"

const viewOptions = [
  { label: "全部", value: "all" },
  { label: "今天", value: "today" },
  { label: "明天", value: "tomorrow" },
  { label: "未来7天", value: "next7" },
  { label: "逾期", value: "overdue" },
  { label: "无日期", value: "nodate" },
  { label: "收件箱", value: "inbox" }
]

const statusOptions = [
  { label: "待办", value: "todo" },
  { label: "已完成", value: "done" },
  { label: "全部", value: "all" }
]

Page({
  data: {
    lists: [] as ListItem[],
    tasks: [] as TaskItem[],
    viewOptions,
    statusOptions,
    listIndex: 0,
    viewIndex: 0,
    statusIndex: 0,
    searchQuery: "",
    loading: false
  },
  onShow() {
    this.bootstrap()
  },
  async onPullDownRefresh() {
    await this.bootstrap()
    wx.stopPullDownRefresh()
  },
  async bootstrap() {
    this.setData({ loading: true })
    try {
      await this.fetchLists()
      await this.fetchTasks()
    } finally {
      this.setData({ loading: false })
    }
  },
  async fetchLists() {
    const lists = await listLists()
    const allList = { id: "", name: "全部", user_id: "", created_at: "", updated_at: "" } as ListItem
    this.setData({ lists: [allList, ...lists] })
  },
  async fetchTasks() {
    const listId = this.data.lists[this.data.listIndex]?.id || ""
    const viewType = viewOptions[this.data.viewIndex].value
    const statusValue = statusOptions[this.data.statusIndex].value

    if (viewType === "all") {
      const params: Record<string, any> = {}
      if (listId) params.list_id = listId
      if (this.data.searchQuery) params.query = this.data.searchQuery
      if (statusValue !== "all") params.status = statusValue
      const tasks = await listTasks(params)
      this.setData({ tasks })
      return
    }

    const tasks = await smartList(viewType, {
      list_id: listId || undefined,
      status: "todo"
    })
    this.setData({ tasks })
  },
  onListChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ listIndex: Number(event.detail.value) })
    this.fetchTasks()
  },
  onViewChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ viewIndex: Number(event.detail.value) })
    this.fetchTasks()
  },
  onStatusChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ statusIndex: Number(event.detail.value) })
    this.fetchTasks()
  },
  onSearchInput(event: WechatMiniprogram.Input) {
    this.setData({ searchQuery: event.detail.value })
  },
  onSearchConfirm() {
    this.fetchTasks()
  },
  goToDetail(event: WechatMiniprogram.TouchEvent) {
    const taskId = event.currentTarget.dataset.id as string
    wx.navigateTo({ url: `/pages/tasks/detail/detail?id=${taskId}` })
  },
  goToCreate() {
    const listId = this.data.lists[this.data.listIndex]?.id
    const query = listId ? `?mode=create&list_id=${listId}` : "?mode=create"
    wx.navigateTo({ url: `/pages/tasks/detail/detail${query}` })
  },
  async toggleTask(event: WechatMiniprogram.SwitchChange) {
    const taskId = event.currentTarget.dataset.id as string
    const checked = event.detail.value
    await updateTask(taskId, { status: checked ? "done" : "todo" })
    this.fetchTasks()
  }
})
