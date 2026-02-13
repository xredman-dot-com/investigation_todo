import { listLists } from "../../../api/lists"
import { createTask, deleteTask, getTask, updateTask } from "../../../api/tasks"
import { createSubtask, deleteSubtask, listSubtasks, updateSubtask } from "../../../api/subtasks"
import { listAttachments, uploadAttachment, deleteAttachment } from "../../../api/attachments"
import { listReminders, createRemindersFromOffsets, deleteReminder } from "../../../api/reminders"
import { snoozeReminder } from "../../../api/reminderJobs"
import { REMINDER_OFFSETS } from "../../../utils/config"
import type { AttachmentItem, ListItem, ReminderItem, SubtaskItem } from "../../../api/types"

const priorityOptions = [0, 1, 2, 3, 4]
const eisenhowerOptions = ["", "Q1", "Q2", "Q3", "Q4"]
const repeatOptions = [
  { label: "不重复", value: "" },
  { label: "每天", value: "daily" },
  { label: "每周", value: "weekly" },
  { label: "每月", value: "monthly" },
  { label: "每年", value: "yearly" }
]

Page({
  data: {
    taskId: "",
    mode: "edit",
    lists: [] as ListItem[],
    listIndex: 0,
    form: {
      list_id: "",
      title: "",
      description: "",
      meaning: "",
      due_date: "",
      due_time: "",
      priority: 0,
      tagsText: "",
      is_important: false,
      eisenhower_quadrant: "",
      status: "todo",
      repeat_freq: "",
      repeat_interval: 1
    },
    subtasks: [] as SubtaskItem[],
    newSubtaskTitle: "",
    attachments: [] as AttachmentItem[],
    reminders: [] as ReminderItem[],
    reminderOffsets: REMINDER_OFFSETS.map((value) => ({ label: `${value}分钟`, value, checked: false })),
    loading: false,
    priorityOptions,
    eisenhowerOptions,
    repeatOptions,
    repeatIndex: 0,
    quadrantIndex: 0
  },
  onLoad(options: { id?: string; mode?: string; list_id?: string }) {
    const taskId = options.id || ""
    const mode = options.mode || (taskId ? "edit" : "create")
    this.setData({ taskId, mode })
    this.bootstrap(options.list_id)
  },
  async onPullDownRefresh() {
    await this.bootstrap()
    wx.stopPullDownRefresh()
  },
  async bootstrap(prefillListId?: string) {
    this.setData({ loading: true })
    try {
      await this.fetchLists(prefillListId)
      if (this.data.taskId) {
        await this.fetchTask()
        await Promise.all([this.fetchSubtasks(), this.fetchAttachments(), this.fetchReminders()])
      }
    } finally {
      this.setData({ loading: false })
    }
  },
  async fetchLists(prefillListId?: string) {
    const lists = await listLists()
    const selectedListId = prefillListId || this.data.form.list_id || lists[0]?.id || ""
    const listIndex = Math.max(
      0,
      lists.findIndex((item) => item.id === selectedListId)
    )
    this.setData({ lists, listIndex, "form.list_id": selectedListId })
  },
  async fetchTask() {
    const task = await getTask(this.data.taskId)
    const listIndex = Math.max(
      0,
      this.data.lists.findIndex((item) => item.id === task.list_id)
    )
    const quadrantIndex = Math.max(
      0,
      eisenhowerOptions.findIndex((item) => item === (task.eisenhower_quadrant || ""))
    )
    const repeatIndex = Math.max(
      0,
      repeatOptions.findIndex((item) => item.value === (task.repeat_rule?.freq || ""))
    )
    this.setData({
      listIndex,
      quadrantIndex,
      repeatIndex,
      form: {
        list_id: task.list_id,
        title: task.title,
        description: task.description || "",
        meaning: task.meaning || "",
        due_date: task.due_date || "",
        due_time: task.due_time || "",
        priority: task.priority,
        tagsText: (task.tags || []).join(","),
        is_important: !!task.is_important,
        eisenhower_quadrant: task.eisenhower_quadrant || "",
        status: task.status,
        repeat_freq: task.repeat_rule?.freq || "",
        repeat_interval: task.repeat_rule?.interval || 1
      }
    })
  },
  async fetchSubtasks() {
    if (!this.data.taskId) return
    const subtasks = await listSubtasks(this.data.taskId)
    this.setData({ subtasks })
  },
  async fetchAttachments() {
    if (!this.data.taskId) return
    const attachments = await listAttachments(this.data.taskId)
    this.setData({ attachments })
  },
  async fetchReminders() {
    if (!this.data.taskId) return
    const reminders = await listReminders(this.data.taskId)
    this.setData({ reminders })
  },
  onInputChange(event: WechatMiniprogram.Input) {
    const field = event.currentTarget.dataset.field as string
    this.setData({ [`form.${field}`]: event.detail.value })
  },
  onSwitchChange(event: WechatMiniprogram.SwitchChange) {
    const field = event.currentTarget.dataset.field as string
    this.setData({ [`form.${field}`]: event.detail.value })
  },
  onListChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value)
    const listId = this.data.lists[index]?.id || ""
    this.setData({ listIndex: index, "form.list_id": listId })
  },
  onPriorityChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value)
    const value = priorityOptions[index] || 0
    this.setData({ "form.priority": value })
  },
  onQuadrantChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value)
    const value = eisenhowerOptions[index] || ""
    this.setData({ "form.eisenhower_quadrant": value, quadrantIndex: index })
  },
  onRepeatChange(event: WechatMiniprogram.PickerChange) {
    const index = Number(event.detail.value)
    const value = repeatOptions[index].value
    this.setData({ "form.repeat_freq": value, repeatIndex: index })
  },
  onDateChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ "form.due_date": event.detail.value })
  },
  onTimeChange(event: WechatMiniprogram.PickerChange) {
    this.setData({ "form.due_time": event.detail.value })
  },
  async saveTask() {
    const form = this.data.form
    if (!form.title) {
      wx.showToast({ title: "请输入标题", icon: "none" })
      return
    }
    const payload: Record<string, any> = {
      list_id: form.list_id,
      title: form.title,
      description: form.description,
      meaning: form.meaning,
      due_date: form.due_date || null,
      due_time: form.due_time || null,
      priority: Number(form.priority || 0),
      tags: form.tagsText ? form.tagsText.split(",").map((value) => value.trim()).filter(Boolean) : [],
      is_important: form.is_important,
      eisenhower_quadrant: form.eisenhower_quadrant || null,
      status: form.status
    }
    if (form.repeat_freq) {
      payload.repeat_rule = {
        freq: form.repeat_freq,
        interval: Number(form.repeat_interval || 1)
      }
    } else {
      payload.repeat_rule = null
    }

    if (this.data.mode === "create") {
      const created = await createTask(payload)
      this.setData({ taskId: created.id, mode: "edit" })
      await Promise.all([this.fetchSubtasks(), this.fetchAttachments(), this.fetchReminders()])
    } else {
      await updateTask(this.data.taskId, payload)
    }
    wx.showToast({ title: "已保存", icon: "success" })
  },
  async removeTask() {
    if (!this.data.taskId) return
    const result = await new Promise((resolve) => {
      wx.showModal({ title: "删除任务", content: "确认删除该任务？", success: (res) => resolve(res.confirm) })
    })
    if (!result) return
    await deleteTask(this.data.taskId)
    wx.navigateBack()
  },
  onSubtaskInput(event: WechatMiniprogram.Input) {
    this.setData({ newSubtaskTitle: event.detail.value })
  },
  async addSubtask() {
    const title = this.data.newSubtaskTitle.trim()
    if (!title || !this.data.taskId) return
    await createSubtask(this.data.taskId, { title })
    this.setData({ newSubtaskTitle: "" })
    await this.fetchSubtasks()
  },
  async toggleSubtask(event: WechatMiniprogram.SwitchChange) {
    const subtaskId = event.currentTarget.dataset.id as string
    const checked = event.detail.value
    await updateSubtask(this.data.taskId, subtaskId, { is_completed: checked })
    await this.fetchSubtasks()
  },
  async removeSubtask(event: WechatMiniprogram.TouchEvent) {
    const subtaskId = event.currentTarget.dataset.id as string
    await deleteSubtask(this.data.taskId, subtaskId)
    await this.fetchSubtasks()
  },
  async chooseAttachment() {
    if (!this.data.taskId) {
      wx.showToast({ title: "请先保存任务", icon: "none" })
      return
    }
    wx.chooseImage({
      count: 1,
      success: async (result) => {
        const filePath = result.tempFilePaths[0]
        if (filePath) {
          await uploadAttachment(this.data.taskId, filePath)
          await this.fetchAttachments()
        }
      }
    })
  },
  previewAttachment(event: WechatMiniprogram.TouchEvent) {
    const url = event.currentTarget.dataset.url as string
    if (url) {
      wx.previewImage({ urls: [url] })
    }
  },
  async removeAttachment(event: WechatMiniprogram.TouchEvent) {
    const attachmentId = event.currentTarget.dataset.id as string
    await deleteAttachment(this.data.taskId, attachmentId)
    await this.fetchAttachments()
  },
  onOffsetChange(event: WechatMiniprogram.CheckboxChange) {
    const selected = event.detail.value.map((value) => Number(value))
    const reminderOffsets = this.data.reminderOffsets.map((item) => ({
      ...item,
      checked: selected.includes(item.value)
    }))
    this.setData({ reminderOffsets })
  },
  async createOffsetsReminder() {
    if (!this.data.taskId) return
    const offsets = this.data.reminderOffsets.filter((item) => item.checked).map((item) => item.value)
    if (!offsets.length) {
      wx.showToast({ title: "请选择提醒时间", icon: "none" })
      return
    }
    await createRemindersFromOffsets(this.data.taskId, offsets)
    await this.fetchReminders()
  },
  async removeReminder(event: WechatMiniprogram.TouchEvent) {
    const reminderId = event.currentTarget.dataset.id as string
    await deleteReminder(this.data.taskId, reminderId)
    await this.fetchReminders()
  },
  async snoozeReminder(event: WechatMiniprogram.TouchEvent) {
    const reminderId = event.currentTarget.dataset.id as string
    await snoozeReminder(reminderId, 10)
    await this.fetchReminders()
  }
})
