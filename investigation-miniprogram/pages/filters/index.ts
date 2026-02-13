import { createFilter, deleteFilter, filterTasks, listFilters } from "../../api/filters"
import type { FilterItem, TaskItem } from "../../api/types"

const statusOptions = [
  { label: "待办", value: "todo" },
  { label: "已完成", value: "done" },
  { label: "不限", value: "" }
]

Page({
  data: {
    filters: [] as FilterItem[],
    selectedTasks: [] as TaskItem[],
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
    this.fetchFilters()
  },
  async onPullDownRefresh() {
    await this.fetchFilters()
    wx.stopPullDownRefresh()
  },
  async fetchFilters() {
    const filters = await listFilters()
    this.setData({ filters })
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
    await this.fetchFilters()
  },
  async removeFilter(event: WechatMiniprogram.TouchEvent) {
    const filterId = event.currentTarget.dataset.id as string
    await deleteFilter(filterId)
    await this.fetchFilters()
  },
  async applyFilter(event: WechatMiniprogram.TouchEvent) {
    const filterId = event.currentTarget.dataset.id as string
    const tasks = await filterTasks(filterId)
    this.setData({ selectedTasks: tasks })
  }
})
