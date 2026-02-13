import { exportFull } from "../../utils/api/exports"
import { listLists, createList, updateList, deleteList } from "../../utils/api/lists"
import { dispatchReminders, listReminderLogs } from "../../utils/api/reminderJobs"
import { getMe, UserProfile } from "../../utils/api/users"
import type { ListItem, SubscriptionMessage } from "../../utils/api/types"

Page({
  data: {
    user: null as UserProfile | null,
    lists: [] as ListItem[],
    newListName: "",
    editNames: {} as Record<string, string>,
    exportText: "",
    reminderLogs: [] as SubscriptionMessage[]
  },
  onShow() {
    this.bootstrap()
  },
  async onPullDownRefresh() {
    await this.bootstrap()
    wx.stopPullDownRefresh()
  },
  async bootstrap() {
    const [user, lists, logs] = await Promise.all([
      getMe(),
      listLists(),
      listReminderLogs()
    ])
    const editNames: Record<string, string> = {}
    lists.forEach((item) => {
      editNames[item.id] = item.name
    })
    this.setData({ user, lists, reminderLogs: logs, editNames })
  },
  onNewListInput(event: WechatMiniprogram.Input) {
    this.setData({ newListName: event.detail.value })
  },
  onEditNameInput(event: WechatMiniprogram.Input) {
    const listId = event.currentTarget.dataset.id as string
    this.setData({ [`editNames.${listId}`]: event.detail.value })
  },
  async addList() {
    if (!this.data.newListName) {
      wx.showToast({ title: "请输入清单名称", icon: "none" })
      return
    }
    await createList({ name: this.data.newListName })
    this.setData({ newListName: "" })
    await this.bootstrap()
  },
  async saveList(event: WechatMiniprogram.TouchEvent) {
    const listId = event.currentTarget.dataset.id as string
    const name = this.data.editNames[listId]
    await updateList(listId, { name })
    await this.bootstrap()
  },
  async removeList(event: WechatMiniprogram.TouchEvent) {
    const listId = event.currentTarget.dataset.id as string
    await deleteList(listId)
    await this.bootstrap()
  },
  async runExport() {
    const payload = await exportFull()
    const text = JSON.stringify(payload, null, 2)
    this.setData({ exportText: text })
    wx.setClipboardData({ data: text })
  },
  async runDispatch() {
    await dispatchReminders()
    const logs = await listReminderLogs()
    this.setData({ reminderLogs: logs })
  }
})
