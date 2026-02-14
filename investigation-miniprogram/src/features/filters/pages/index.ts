import { initPageTheme } from "../../../core/themeMixin"
import { createFilter, deleteFilter, filterTasks, listFilters } from "../services"
import type { FilterItem, TaskItem } from "../model"
import { filtersStore } from "../../../stores/filters"

const statusOptions = [
  { label: "待办", value: "todo" },
  { label: "已完成", value: "done" },
  { label: "不限", value: "" }
]

Page({
  data: {
    filters: [] as FilterItem[],
    selectedTasks: [] as TaskItem[],
    isLoading: false,
    errorMessage: "",
    form: {
      name: "",
      tag: "",
      priority: "",
      statusIndex: 0,
      hasDueDate: false
    },
    statusOptions
  },
  onShow() {
    initPageTheme(this)
    this.fetchFilters()
  },
  async onPullDownRefresh() {
    await this.fetchFilters(true)
    wx.stopPullDownRefresh()
  },
  async fetchFilters(forceRefresh = false) {
    const cached = filtersStore.getState()
    if (!forceRefresh && cached.filters.length) {
      this.setData({ filters: cached.filters })
    }
    filtersStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const filters = await listFilters()
      filtersStore.setState({ filters, loading: false, error: null })
      this.setData({ isLoading: false, errorMessage: "" })
      this.setData({ filters })
    } catch (error) {
      filtersStore.setState({
        loading: false,
        error: error instanceof Error ? error.message : "加载失败",
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败",
      })
    }
  },
  onInputChange(event: WechatMiniprogram.Input) {
    const field = event.currentTarget.dataset.field as string
    this.setData({ [`form.${field}`]: event.detail.value })
  },
  onStatusChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ "form.statusIndex": Number(event.detail.value) })
  },
  onDueSwitch(event: WechatMiniprogram.SwitchChange) {
    this.setData({ "form.hasDueDate": event.detail.value })
  },
  async createFilter() {
    if (!this.data.form.name) {
      wx.showToast({ title: "请输入名称", icon: "none" })
      return
    }
    const statusValue = statusOptions[this.data.form.statusIndex].value
    const priorityValue = this.data.form.priority ? Number(this.data.form.priority) : undefined
    await createFilter({
      name: this.data.form.name,
      criteria: {
        tag: this.data.form.tag || undefined,
        priority: priorityValue,
        status: statusValue || undefined,
        has_due_date: this.data.form.hasDueDate
      }
    })
    this.setData({ form: { name: "", tag: "", priority: "", statusIndex: 0, hasDueDate: false } })
    await this.fetchFilters(true)
  },
  async removeFilter(event: WechatMiniprogram.TouchEvent) {
    const filterId = event.currentTarget.dataset.id as string
    await deleteFilter(filterId)
    await this.fetchFilters(true)
  },
  async applyFilter(event: WechatMiniprogram.TouchEvent) {
    const filterId = event.currentTarget.dataset.id as string
    const tasks = await filterTasks(filterId)
    filtersStore.setState({ previewTasks: tasks })
    this.setData({ selectedTasks: tasks })
  }
})
