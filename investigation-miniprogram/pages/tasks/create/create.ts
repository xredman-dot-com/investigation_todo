// pages/tasks/create/create.ts
import { createTask } from '../../../utils/api/tasks'
import { listLists } from '../../../utils/api/lists'
import type { ListItem } from '../../../utils/api/types'

Page({
  data: {
    title: '',
    description: '',
    meaning: '',
    dueDate: '',
    dueTime: '',
    listId: '',
    currentList: { id: '', name: '收件箱' } as ListItem,
    priority: 4,
    priorityLabels: ['高优先级', '中优先级', '低优先级', '无优先级'],
    tags: [] as string[],
    subtasks: [] as Array<{ title: string; completed: boolean }>,
    lists: [] as ListItem[]
  },

  onLoad(options: Record<string, string>) {
    const listId = options.listId || ''
    this.setData({ listId })
    this.loadLists(listId)
  },

  async loadLists(preselectedListId = '') {
    try {
      const lists = await listLists()
      const currentList = lists.find((l) => l.id === preselectedListId) || lists[0] || { id: '', name: '收件箱', user_id: '', created_at: '', updated_at: '' }
      this.setData({
        lists,
        currentList,
        listId: currentList.id
      })
    } catch (error) {
      console.error('Failed to load lists:', error)
    }
  },

  onTitleInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ title: e.detail.value })
  },

  onDescriptionInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ description: e.detail.value })
  },

  onMeaningInput(e: WechatMiniprogram.CustomEvent) {
    this.setData({ meaning: e.detail.value })
  },

  onSelectDate() {
    const that = this
    wx.showModal({
      title: '设置日期',
      editable: true,
      placeholderText: '格式：2024-02-13',
      success: (res) => {
        if (res.confirm && res.content) {
          that.setData({ dueDate: res.content })
        }
      }
    })
  },

  onSelectTime() {
    const that = this
    wx.showModal({
      title: '设置时间',
      editable: true,
      placeholderText: '格式：14:30',
      success: (res) => {
        if (res.confirm && res.content) {
          that.setData({ dueTime: res.content })
        }
      }
    })
  },

  onSelectList() {
    const that = this
    const itemList = this.data.lists.map((l) => l.name)
    wx.showActionSheet({
      itemList: itemList.length > 0 ? itemList : ['收件箱'],
      success: (res) => {
        const selectedList = that.data.lists[res.tapIndex] || { id: 0, name: '收件箱' }
        that.setData({
          currentList: selectedList,
          listId: selectedList.id
        })
      }
    })
  },

  onSelectPriority() {
    const that = this
    wx.showActionSheet({
      itemList: ['🔴 高优先级', '🟠 中优先级', '🔵 低优先级', '⚪ 无优先级'],
      success: (res) => {
        that.setData({ priority: res.tapIndex })
      }
    })
  },

  onSelectTags() {
    wx.showToast({ title: '标签编辑功能开发中', icon: 'none' })
  },

  onAddSubtask() {
    const subtasks = [...this.data.subtasks, { title: '', completed: false }]
    this.setData({ subtasks })
  },

  onSubtaskInput(e: WechatMiniprogram.CustomEvent) {
    const { index } = e.currentTarget.dataset
    const subtasks = [...this.data.subtasks]
    subtasks[index].title = e.detail.value
    this.setData({ subtasks })
  },

  onToggleSubtask(e: WechatMiniprogram.CustomEvent) {
    const { index } = e.currentTarget.dataset
    const subtasks = [...this.data.subtasks]
    subtasks[index].completed = !subtasks[index].completed
    this.setData({ subtasks })
  },

  onDeleteSubtask(e: WechatMiniprogram.CustomEvent) {
    const { index } = e.currentTarget.dataset
    const subtasks = this.data.subtasks.filter((_, i) => i !== index)
    this.setData({ subtasks })
  },

  onCancel() {
    wx.navigateBack()
  },

  async onSave() {
    if (!this.data.title.trim()) {
      wx.showToast({ title: '请输入任务标题', icon: 'none' })
      return
    }

    try {
      await createTask({
        title: this.data.title,
        description: this.data.description,
        meaning: this.data.meaning,
        due_date: this.data.dueDate,
        due_time: this.data.dueTime,
        list_id: this.data.listId,
        priority: this.data.priority,
        tags: this.data.tags,
        subtasks: this.data.subtasks.filter((s) => s.title.trim())
      })

      wx.showToast({ title: '创建成功', icon: 'success' })

      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Failed to create task:', error)
      wx.showToast({ title: '创建失败', icon: 'none' })
    }
  }
})
