// pages/tasks/list/list.ts
import { listTasks, updateTask, deleteTask, createTask } from '../utils/api/tasks'
import { listLists } from '../utils/api/lists'
import type { TaskItem, ListItem } from '../utils/api/types'

interface TaskGroup {
  todo: TaskItem[]
  done: TaskItem[]
}

interface ListWithTasks extends ListItem {
  tasks: TaskGroup
}

Page({
  data: {
    lists: [] as ListWithTasks[],
    currentListIndex: 0,
    currentList: {} as ListItem,
    hasPrevList: false,
    hasNextList: false,
    showSwipePanel: false,
    selectedTaskId: ''
  },

  async onLoad() {
    await this.loadLists()
  },

  async loadLists() {
    wx.showLoading({ title: '加载中...' })
    try {
      const lists = await listLists() as ListItem[]

      // 为每个清单加载任务
      const listsWithTasks = await Promise.all(
        lists.map(async (list) => {
          const tasks = await listTasks({ list_id: list.id })
          return {
            ...list,
            tasks: this.groupTasks(tasks)
          }
        })
      )

      this.setData({
        lists: listsWithTasks,
        currentList: listsWithTasks[0] || { name: '收件箱', id: '' },
        hasPrevList: false,
        hasNextList: listsWithTasks.length > 1
      })
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
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
  },

  onMenu() {
    wx.showActionSheet({
      itemList: ['系统设置', '用户中心', '关于'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.switchTab({ url: '/pages/settings/settings' })
            break
          case 1:
            wx.showToast({ title: '用户中心开发中', icon: 'none' })
            break
          case 2:
            wx.showModal({ title: '关于', content: '格物清单 v1.0\n基于滴答清单设计的任务管理小程序' })
            break
        }
      }
    })
  },

  onSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  onQuickAdd(e: WechatMiniprogram.CustomEvent) {
    const { title } = e.detail
    this.createTask(title)
  },

  onCreateTask() {
    const listId = this.data.currentList.id
    const query = listId ? `?listId=${listId}` : ''
    wx.navigateTo({
      url: `/pages/tasks/create/create${query}`
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
      await this.loadLists()
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
                  this.loadLists()
                })
              }
            }
          })
        }, 5000)
      }
      await this.loadLists()
    } catch (error) {
      console.error('Failed to toggle task:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onTaskDetail(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.detail
    wx.navigateTo({ url: `/pages/tasks/detail/detail?id=${taskId}` })
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
      url: `/pages/tasks/detail/detail?id=${this.data.selectedTaskId}`
    })
    this.hideSwipePanel()
  },

  async onSwipeDelete() {
    const res = await wx.showModal({ title: '确认删除', content: '删除后无法恢复' })
    if (res.confirm) {
      try {
        await deleteTask(this.data.selectedTaskId)
        wx.showToast({ title: '已删除', icon: 'success' })
        await this.loadLists()
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
    for (const list of this.data.lists) {
      const task = [...list.tasks.todo, ...list.tasks.done].find(t => t.id === taskId)
      if (task) return task
    }
    return undefined
  }
})
