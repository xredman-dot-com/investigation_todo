// pages/tasks/list/list.ts
import { listTasks, updateTask, deleteTask, createTask, listLists } from '../../services'
import { filterTasks } from "../../../../services/filters"
import type { TaskItem, ListItem } from '../../model'
import { tasksStore } from "../../../../stores/tasks"
import { initPageTheme } from '../../../../core/themeMixin'

interface TaskGroup {
  todo: TaskItem[]
  done: TaskItem[]
}

interface ListWithTasks extends ListItem {
  tasks: TaskGroup
}

type TaskViewMode = "lists" | "smart" | "filter"
type SmartViewKey = "today" | "tomorrow" | "next7" | "inbox" | "all"

Page({
  data: {
    lists: [] as ListWithTasks[],
    currentListIndex: 0,
    currentList: {} as ListItem,
    headerTitle: "任务",
    hasPrevList: false,
    hasNextList: false,
    showSwipePanel: false,
    selectedTaskId: '',
    isLoading: false,
    errorMessage: '',
    viewMode: "lists" as TaskViewMode,
    smartTitle: "",
    smartTasks: { todo: [], done: [] } as TaskGroup,
    filterId: "",
    smartViewKey: "" as SmartViewKey | ""
  },

  async onLoad() {
    // 初始化主题
    initPageTheme(this)
    await this.loadLists()
  },
  
  onShow() {
    // 页面显示时刷新主题
    initPageTheme(this)
    this.applyMenuSelection()
  },

  applyStoreState(lists: ListItem[], tasksByListId: Record<string, TaskItem[]>, activeListId: string | null) {
    const listsWithTasks = lists.map((list) => ({
      ...list,
      tasks: this.groupTasks(tasksByListId[list.id] || [])
    }))
    const resolvedIndex = activeListId
      ? Math.max(0, listsWithTasks.findIndex((item) => item.id === activeListId))
      : 0
    const currentList = listsWithTasks[resolvedIndex] || { name: '收件箱', id: '' }
    this.setData({
      lists: listsWithTasks,
      currentListIndex: resolvedIndex,
      currentList,
      headerTitle: currentList.name || "任务",
      hasPrevList: resolvedIndex > 0,
      hasNextList: resolvedIndex < listsWithTasks.length - 1,
      viewMode: "lists"
    })
  },

  async loadLists(forceRefresh = false) {
    const cached = tasksStore.getState()
    if (!forceRefresh && cached.lists.length) {
      this.applyStoreState(cached.lists, cached.tasksByListId, cached.activeListId)
    }
    tasksStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: '' })
    wx.showLoading({ title: '加载中...' })
    try {
      const lists = await listLists() as ListItem[]

      // 为每个清单加载任务
      const tasksByListId: Record<string, TaskItem[]> = {}
      const allTasks: TaskItem[] = []
      await Promise.all(
        lists.map(async (list) => {
          const tasks = await listTasks({ list_id: list.id })
          tasksByListId[list.id] = tasks
          allTasks.push(...tasks)
        })
      )

      const activeListId = cached.activeListId || lists[0]?.id || null
      tasksStore.setState({
        lists,
        tasksByListId,
        tasks: allTasks,
        activeListId,
        loading: false,
        error: null,
      })
      this.setData({ isLoading: false, errorMessage: '' })
      this.applyStoreState(lists, tasksByListId, activeListId)
    } catch (error) {
      tasksStore.setState({
        loading: false,
        error: error instanceof Error ? error.message : "加载失败",
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败"
      })
    } finally {
      wx.hideLoading()
    }
  },

  applyMenuSelection() {
    const selection = wx.getStorageSync("menu:taskView")
    if (!selection) return
    wx.removeStorageSync("menu:taskView")
    const view = selection.view as string
    if (view === "list" && selection.listId) {
      tasksStore.setState({ activeListId: selection.listId })
      this.loadLists(true)
      return
    }
    if (view === "filter" && selection.filterId) {
      this.loadFilteredTasks(selection.filterId, selection.filterName)
      return
    }
    if (["today", "tomorrow", "next7", "inbox", "all"].includes(view)) {
      this.loadSmartTasks(view as SmartViewKey)
    }
  },

  async loadFilteredTasks(filterId: string, filterName?: string) {
    this.setData({ isLoading: true, errorMessage: "", viewMode: "filter", filterId })
    wx.showLoading({ title: "加载中..." })
    try {
      const tasks = await filterTasks(filterId)
      const grouped = this.groupTasks(tasks)
      this.setData({
        smartTitle: filterName || "过滤器",
        smartTasks: grouped,
        headerTitle: filterName || "过滤器",
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败"
      })
    } finally {
      wx.hideLoading()
    }
  },

  async loadSmartTasks(view: SmartViewKey) {
    this.setData({ isLoading: true, errorMessage: "", viewMode: "smart" })
    wx.showLoading({ title: "加载中..." })
    try {
      let tasks: TaskItem[] = []
      let title = ""
      if (view === "today" || view === "tomorrow" || view === "next7") {
        const range = this.buildDateRange(view)
        tasks = await listTasks(range)
        title = view === "today" ? "今天" : view === "tomorrow" ? "明天" : "最近七天"
      } else if (view === "all") {
        tasks = await listTasks()
        title = "全部任务"
      } else if (view === "inbox") {
        const lists = await listLists()
        const inbox = lists.find((list) => list.name === "Inbox" || list.name === "收件箱")
        if (inbox) {
          tasks = await listTasks({ list_id: inbox.id })
        }
        title = "收集箱"
      }
      this.setData({
        smartTitle: title,
        smartViewKey: view,
        smartTasks: this.groupTasks(tasks),
        headerTitle: title,
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败"
      })
    } finally {
      wx.hideLoading()
    }
  },

  buildDateRange(view: "today" | "tomorrow" | "next7") {
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const end = new Date(start)
    if (view === "tomorrow") {
      start.setDate(start.getDate() + 1)
      end.setDate(start.getDate())
    } else if (view === "next7") {
      end.setDate(start.getDate() + 6)
    }
    const toStr = (value: Date) => value.toISOString().slice(0, 10)
    return {
      due_date_from: toStr(start),
      due_date_to: toStr(end)
    }
  },

  groupTasks(tasks: TaskItem[]): TaskGroup {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      done: tasks.filter(t => t.status === 'done')
    }
  },

  onListChange(e: WechatMiniprogram.SwiperChange) {
    const index = e.detail.current
    const lists = this.data.lists

    this.setData({
      currentListIndex: index,
      currentList: lists[index],
      hasPrevList: index > 0,
      hasNextList: index < lists.length - 1
    })
    tasksStore.setState({ activeListId: lists[index]?.id || null })
  },

  onRetryLoad() {
    this.loadLists(true)
  },

  onSearch() {
    wx.navigateTo({ url: '/features/search/pages/search' })
  },

  onQuickAdd(e: WechatMiniprogram.CustomEvent) {
    const { title } = e.detail
    this.createTask(title)
  },

  onCreateTask() {
    const listId = this.data.viewMode === "lists" ? this.data.currentList.id : ""
    const query = listId ? `?listId=${listId}` : ''
    wx.navigateTo({
      url: `/features/tasks/pages/create/create${query}`
    })
  },

  async createTask(title: string) {
    if (!title.trim()) return

    wx.showLoading({ title: '添加中...' })
    try {
      await createTask({
        list_id: this.data.currentList.id || undefined,
        title,
        status: 'todo'
      })
      wx.showToast({ title: '已添加', icon: 'success' })
      await this.loadLists(true)
    } catch (error) {
      console.error('Failed to create task:', error)
      wx.showToast({ title: '添加失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  async onTaskToggle(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.detail
    const task = this.findTask(taskId)
    if (!task) return

    const newStatus = task.status === 'done' ? 'todo' : 'done'

    try {
      await updateTask(taskId, { status: newStatus })
      if (newStatus === 'done') {
        wx.showToast({ title: '已完成', icon: 'success', duration: 1500 })

        // 5秒后可撤回
        setTimeout(() => {
          wx.showModal({
            title: '撤回',
            content: '是否撤回已完成状态？',
            confirmText: '撤回',
            cancelText: '保持完成',
            success: (res) => {
              if (res.confirm) {
                updateTask(taskId, { status: 'todo' }).then(() => {
                  this.reloadCurrentView()
                })
              }
            }
          })
        }, 5000)
      }
      await this.reloadCurrentView()
    } catch (error) {
      console.error('Failed to toggle task:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onTaskDetail(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.detail
    wx.navigateTo({ url: `/features/tasks/pages/detail/detail?id=${taskId}` })
  },

  onTaskMore(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.detail
    this.setData({ showSwipePanel: true, selectedTaskId: taskId })
  },

  hideSwipePanel() {
    this.setData({ showSwipePanel: false })
  },

  noop() {},

  async onSwipeComplete() {
    await this.onTaskToggle({ detail: { taskId: this.data.selectedTaskId } })
    this.hideSwipePanel()
  },

  onSwipeEdit() {
    wx.navigateTo({
      url: `/features/tasks/pages/detail/detail?id=${this.data.selectedTaskId}`
    })
    this.hideSwipePanel()
  },

  async onSwipeDelete() {
    const res = await wx.showModal({ title: '确认删除', content: '删除后无法恢复' })
      if (res.confirm) {
        try {
          await deleteTask(this.data.selectedTaskId)
          wx.showToast({ title: '已删除', icon: 'success' })
          await this.reloadCurrentView()
        } catch (error) {
          console.error('Failed to delete task:', error)
          wx.showToast({ title: '删除失败', icon: 'none' })
      }
    }
    this.hideSwipePanel()
  },

  onLoadMore() {
    // TODO: 分页加载
  },

  findTask(taskId: string): TaskItem | undefined {
    if (this.data.viewMode !== "lists") {
      return [...this.data.smartTasks.todo, ...this.data.smartTasks.done].find((task) => task.id === taskId)
    }
    for (const list of this.data.lists) {
      const task = [...list.tasks.todo, ...list.tasks.done].find(t => t.id === taskId)
      if (task) return task
    }
    return undefined
  },

  async reloadCurrentView() {
    if (this.data.viewMode === "lists") {
      await this.loadLists(true)
      return
    }
    if (this.data.viewMode === "filter") {
      await this.loadFilteredTasks(this.data.filterId, this.data.smartTitle)
      return
    }
    if (this.data.smartViewKey) {
      await this.loadSmartTasks(this.data.smartViewKey)
    }
  }
})
