import { exportFull, listLists, createList, updateList, deleteList, dispatchReminders, listReminderLogs, getMe } from "../services"
import type { UserProfile } from "../services"
import type { ListItem, SubscriptionMessage } from "../model"
import { settingsStore } from "../../../stores/settings"

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
    await this.bootstrap(true)
    wx.stopPullDownRefresh()
  },
  applyStoreState(user: UserProfile | null, lists: ListItem[], logs: SubscriptionMessage[]) {
    const editNames: Record<string, string> = {}
    lists.forEach((item) => {
      editNames[item.id] = item.name
    })
    this.setData({ user, lists, reminderLogs: logs, editNames })
  },
  async bootstrap(forceRefresh = false) {
    const cached = settingsStore.getState()
    if (!forceRefresh && (cached.user || cached.lists.length || cached.subscriptions.length)) {
      this.applyStoreState(cached.user, cached.lists, cached.subscriptions)
    }
    settingsStore.setState({ loading: true, error: null })
    try {
      const [user, lists, logs] = await Promise.all([
        getMe(),
        listLists(),
        listReminderLogs()
      ])
      settingsStore.setState({
        user,
        lists,
        subscriptions: logs,
        loading: false,
        error: null,
      })
      this.applyStoreState(user, lists, logs)
    } catch (error) {
      settingsStore.setState({
        loading: false,
        error: error instanceof Error ? error.message : "加载失败",
      })
    }
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
    await this.bootstrap(true)
  },
  async saveList(event: WechatMiniprogram.TouchEvent) {
    const listId = event.currentTarget.dataset.id as string
    const name = this.data.editNames[listId]
    await updateList(listId, { name })
    await this.bootstrap(true)
  },
  async removeList(event: WechatMiniprogram.TouchEvent) {
    const listId = event.currentTarget.dataset.id as string
    await deleteList(listId)
    await this.bootstrap(true)
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
    settingsStore.setState({ subscriptions: logs })
    this.setData({ reminderLogs: logs })
  }
})
