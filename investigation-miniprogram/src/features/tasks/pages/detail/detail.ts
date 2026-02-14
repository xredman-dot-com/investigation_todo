// pages/tasks/detail/detail.ts
import { initPageTheme } from "../../../../core/themeMixin"
import { getTask, updateTask, deleteTask, listSubtasks } from '../../services'
import type { TaskItem } from '../../model'
import { tasksStore } from "../../../../stores/tasks"

Page({
  data: {
    taskId: '',
    task: {} as TaskItem,
    subtasks: [],
    completedSubtasks: 0,
    priorityLabels: ['无', '低', '中', '高'],
    changes: {} as Partial<TaskItem>,
    showTagEditor: false,
    isLoading: false,
    errorMessage: ''
  },

  async onLoad(options: Record<string, string>) {
    initPageTheme(this)
    const { id } = options
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }

    this.setData({ taskId: id })
    await this.loadTask()
  },

  onRetryLoad() {
    this.loadTask(true)
  },

  applyTask(task: TaskItem | undefined) {
    if (!task) return
    this.setData({ task })
    wx.setNavigationBarTitle({ title: task.title || '任务详情' })
  },

  async loadTask(forceRefresh = false) {
    const cached = tasksStore.getState()
    if (!forceRefresh && cached.tasks.length) {
      const cachedTask = cached.tasks.find((item) => item.id === this.data.taskId)
      this.applyTask(cachedTask)
    }
    tasksStore.setState({ loading: true, error: null })
    this.setData({ isLoading: true, errorMessage: '' })
    wx.showLoading({ title: '加载中...' })
    try {
      const task = await getTask(this.data.taskId)
      const subtasks = await listSubtasks(this.data.taskId)

      const completedSubtasks = subtasks.filter(s => s.is_completed).length

      const nextTasks = cached.tasks.some((item) => item.id === task.id)
        ? cached.tasks.map((item) => (item.id === task.id ? task : item))
        : [...cached.tasks, task]
      const tasksByListId = { ...cached.tasksByListId }
      if (task.list_id) {
        const listTasks = tasksByListId[task.list_id] || []
        const nextListTasks = listTasks.some((item) => item.id === task.id)
          ? listTasks.map((item) => (item.id === task.id ? task : item))
          : [...listTasks, task]
        tasksByListId[task.list_id] = nextListTasks
      }
      tasksStore.setState({
        tasks: nextTasks,
        tasksByListId,
        loading: false,
        error: null,
      })

      this.setData({
        task,
        subtasks,
        completedSubtasks,
        isLoading: false,
        errorMessage: ''
      })

      wx.setNavigationBarTitle({ title: task.title || '任务详情' })
    } catch (error) {
      console.error('Failed to load task:', error)
      tasksStore.setState({
        loading: false,
        error: error instanceof Error ? error.message : "加载失败",
      })
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : '加载失败'
      })
    } finally {
      wx.hideLoading()
    }
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    this.updateChanges('title', e.detail.value)
  },

  onDescriptionInput(e: WechatMiniprogram.Input) {
    this.updateChanges('description', e.detail.value)
  },

  onMeaningInput(e: WechatMiniprogram.Input) {
    this.updateChanges('meaning', e.detail.value)
  },

  updateChanges(key: keyof TaskItem, value: any) {
    const changes = this.data.changes
    changes[key] = value
    this.setData({ changes })
  },

  async onToggle() {
    const newStatus = this.data.task.status === 'done' ? 'todo' : 'done'
    try {
      await updateTask(this.data.taskId, { status: newStatus })
      this.setData({ 'task.status': newStatus })
      tasksStore.setState((prev) => ({
        tasks: prev.tasks.map((item) => item.id === this.data.taskId ? { ...item, status: newStatus } : item),
        tasksByListId: this.data.task.list_id
          ? {
              ...prev.tasksByListId,
              [this.data.task.list_id]: (prev.tasksByListId[this.data.task.list_id] || []).map((item) =>
                item.id === this.data.taskId ? { ...item, status: newStatus } : item
              )
            }
          : prev.tasksByListId
      }))
      wx.showToast({ title: newStatus === 'done' ? '已完成' : '已恢复', icon: 'success' })
    } catch (error) {
      console.error('Failed to toggle task:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onDateClick() {
    const that = this
    const currentDate = this.data.task.due_date ? new Date(this.data.task.due_date) : new Date()

    wx.showModal({
      title: '选择日期',
      editable: true,
      placeholderText: currentDate.toISOString().split('T')[0],
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await updateTask(that.data.taskId, { due_date: res.content })
            that.setData({ 'task.due_date': res.content })
            tasksStore.setState((prev) => ({
              tasks: prev.tasks.map((item) => item.id === that.data.taskId ? { ...item, due_date: res.content } : item),
              tasksByListId: that.data.task.list_id
                ? {
                    ...prev.tasksByListId,
                    [that.data.task.list_id]: (prev.tasksByListId[that.data.task.list_id] || []).map((item) =>
                      item.id === that.data.taskId ? { ...item, due_date: res.content } : item
                    )
                  }
                : prev.tasksByListId
            }))
            wx.showToast({ title: '已设置', icon: 'success' })
          } catch (error) {
            console.error('Failed to update date:', error)
            wx.showToast({ title: '设置失败', icon: 'none' })
          }
        }
      }
    })
  },

  onTimeClick() {
    const that = this
    wx.showModal({
      title: '选择时间',
      editable: true,
      placeholderText: this.data.task.due_time || '09:00',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await updateTask(that.data.taskId, { due_time: res.content })
            that.setData({ 'task.due_time': res.content })
            tasksStore.setState((prev) => ({
              tasks: prev.tasks.map((item) => item.id === that.data.taskId ? { ...item, due_time: res.content } : item),
              tasksByListId: that.data.task.list_id
                ? {
                    ...prev.tasksByListId,
                    [that.data.task.list_id]: (prev.tasksByListId[that.data.task.list_id] || []).map((item) =>
                      item.id === that.data.taskId ? { ...item, due_time: res.content } : item
                    )
                  }
                : prev.tasksByListId
            }))
            wx.showToast({ title: '已设置', icon: 'success' })
          } catch (error) {
            console.error('Failed to update time:', error)
            wx.showToast({ title: '设置失败', icon: 'none' })
          }
        }
      }
    })
  },

  onListClick() {
    const that = this
    // TODO: Load actual lists from backend
    wx.showActionSheet({
      itemList: ['收件箱', '工作', '个人', '学习'],
      success: async (res) => {
        try {
          const listId = res.tapIndex + 1
          await updateTask(that.data.taskId, { list_id: listId })
          // @ts-ignore
          that.setData({ 'task.list_id': listId })
          tasksStore.setState((prev) => ({
            tasks: prev.tasks.map((item) => item.id === that.data.taskId ? { ...item, list_id: listId } : item),
            tasksByListId: {
              ...prev.tasksByListId,
              [listId]: [...(prev.tasksByListId[listId] || []), { ...that.data.task, list_id: listId }],
            }
          }))
          wx.showToast({ title: '已移动', icon: 'success' })
        } catch (error) {
          console.error('Failed to update list:', error)
          wx.showToast({ title: '移动失败', icon: 'none' })
        }
      }
    })
  },

  onPriorityClick() {
    wx.showActionSheet({
      itemList: ['无优先级', '低优先级', '中优先级', '高优先级'],
      success: async (res) => {
        try {
          await updateTask(this.data.taskId, { priority: res.tapIndex })
          this.setData({ 'task.priority': res.tapIndex })
          tasksStore.setState((prev) => ({
            tasks: prev.tasks.map((item) => item.id === this.data.taskId ? { ...item, priority: res.tapIndex } : item),
            tasksByListId: this.data.task.list_id
              ? {
                  ...prev.tasksByListId,
                  [this.data.task.list_id]: (prev.tasksByListId[this.data.task.list_id] || []).map((item) =>
                    item.id === this.data.taskId ? { ...item, priority: res.tapIndex } : item
                  )
                }
              : prev.tasksByListId
          }))
        } catch (error) {
          console.error('Failed to update priority:', error)
          wx.showToast({ title: '更新失败', icon: 'none' })
        }
      }
    })
  },

  onTagsClick() {
    this.setData({ showTagEditor: true })
  },

  onTagConfirm(e: WechatMiniprogram.CustomEvent) {
    const { tags } = e.detail
    try {
      // TODO: Call API to update tags
      // await updateTask(this.data.taskId, { tags })

      this.setData({
        'task.tags': tags,
        showTagEditor: false
      })

      wx.showToast({ title: '标签已更新', icon: 'success' })
    } catch (error) {
      console.error('Failed to update tags:', error)
      wx.showToast({ title: '更新失败', icon: 'none' })
    }
  },

  onTagCancel() {
    this.setData({ showTagEditor: false })
  },

  async onToggleSubtask(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset
    const subtask = this.data.subtasks[index]

    if (!subtask) return

    try {
      // TODO: Call API to toggle subtask
      // await updateSubtask(subtask.id, { is_completed: !subtask.is_completed })

      const subtasks = [...this.data.subtasks]
      subtasks[index].is_completed = !subtasks[index].is_completed

      const completedSubtasks = subtasks.filter(s => s.is_completed).length

      this.setData({
        subtasks,
        completedSubtasks
      })
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async onSave() {
    if (Object.keys(this.data.changes).length === 0) {
      wx.navigateBack()
      return
    }

    this.setData({ isLoading: true, errorMessage: '' })
    wx.showLoading({ title: '保存中...' })
    try {
      await updateTask(this.data.taskId, this.data.changes)
      tasksStore.setState((prev) => ({
        tasks: prev.tasks.map((item) => item.id === this.data.taskId ? { ...item, ...this.data.changes } : item),
        tasksByListId: this.data.task.list_id
          ? {
              ...prev.tasksByListId,
              [this.data.task.list_id]: (prev.tasksByListId[this.data.task.list_id] || []).map((item) =>
                item.id === this.data.taskId ? { ...item, ...this.data.changes } : item
              )
            }
          : prev.tasksByListId
      }))
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (error) {
      console.error('Failed to save task:', error)
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : '保存失败'
      })
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ isLoading: false })
      wx.hideLoading()
    }
  },

  async onDelete() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复'
    })

    if (res.confirm) {
      this.setData({ isLoading: true, errorMessage: '' })
      wx.showLoading({ title: '删除中...' })
      try {
        await deleteTask(this.data.taskId)
        tasksStore.setState((prev) => ({
          tasks: prev.tasks.filter((item) => item.id !== this.data.taskId),
          tasksByListId: this.data.task.list_id
            ? {
                ...prev.tasksByListId,
                [this.data.task.list_id]: (prev.tasksByListId[this.data.task.list_id] || []).filter((item) =>
                  item.id !== this.data.taskId
                )
              }
            : prev.tasksByListId
        }))
        wx.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1500)
      } catch (error) {
        console.error('Failed to delete task:', error)
        this.setData({
          isLoading: false,
          errorMessage: error instanceof Error ? error.message : '删除失败'
        })
        wx.showToast({ title: '删除失败', icon: 'none' })
      } finally {
        this.setData({ isLoading: false })
        wx.hideLoading()
      }
    }
  },

  onBack() {
    wx.navigateBack()
  },

  onMore() {
    wx.showActionSheet({
      itemList: ['复制任务', '移动到清单', '分享'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.setClipboardData({ data: this.data.task.title })
            wx.showToast({ title: '已复制', icon: 'success' })
            break
          case 1:
            wx.showToast({ title: '移动功能开发中', icon: 'none' })
            break
          case 2:
            wx.showToast({ title: '分享功能开发中', icon: 'none' })
            break
        }
      }
    })
  }
})
