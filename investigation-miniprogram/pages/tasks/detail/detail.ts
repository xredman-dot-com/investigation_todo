// pages/tasks/detail/detail.ts
import { getTask, updateTask, deleteTask } from '../../../api/tasks'
import { getSubtasks } from '../../../api/subtasks'
import type { TaskItem } from '../../../api/types'

Page({
  data: {
    taskId: '',
    task: {} as TaskItem,
    subtasks: [],
    completedSubtasks: 0,
    priorityLabels: ['无', '低', '中', '高'],
    changes: {} as Partial<TaskItem>
  },

  async onLoad(options: Record<string, string>) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' })
      wx.navigateBack()
      return
    }

    this.setData({ taskId: id })
    await this.loadTask()
  },

  async loadTask() {
    wx.showLoading({ title: '加载中...' })
    try {
      const task = await getTask(this.data.taskId)
      const subtasks = await getSubtasks(this.data.taskId)

      const completedSubtasks = subtasks.filter(s => s.is_completed).length

      this.setData({
        task,
        subtasks,
        completedSubtasks
      })

      wx.setNavigationBarTitle({ title: task.title || '任务详情' })
    } catch (error) {
      console.error('Failed to load task:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
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
      wx.showToast({ title: newStatus === 'done' ? '已完成' : '已恢复', icon: 'success' })
    } catch (error) {
      console.error('Failed to toggle task:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onDateClick() {
    // TODO: 日期选择器
    wx.showToast({ title: '日期选择器开发中', icon: 'none' })
  },

  onTimeClick() {
    // TODO: 时间选择器
    wx.showToast({ title: '时间选择器开发中', icon: 'none' })
  },

  onListClick() {
    // TODO: 清单选择器
    wx.showToast({ title: '清单选择器开发中', icon: 'none' })
  },

  onPriorityClick() {
    wx.showActionSheet({
      itemList: ['无优先级', '低优先级', '中优先级', '高优先级'],
      success: async (res) => {
        try {
          await updateTask(this.data.taskId, { priority: res.tapIndex })
          this.setData({ 'task.priority': res.tapIndex })
        } catch (error) {
          console.error('Failed to update priority:', error)
          wx.showToast({ title: '更新失败', icon: 'none' })
        }
      }
    })
  },

  onTagsClick() {
    // TODO: 标签编辑器
    wx.showToast({ title: '标签编辑器开发中', icon: 'none' })
  },

  onToggleSubtask(e: WechatMiniprogram.TouchEvent) {
    // TODO: 切换子任务状态
    wx.showToast({ title: '子任务功能开发中', icon: 'none' })
  },

  async onSave() {
    if (Object.keys(this.data.changes).length === 0) {
      wx.navigateBack()
      return
    }

    wx.showLoading({ title: '保存中...' })
    try {
      await updateTask(this.data.taskId, this.data.changes)
      wx.showToast({ title: '已保存', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (error) {
      console.error('Failed to save task:', error)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  async onDelete() {
    const res = await wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复'
    })

    if (res.confirm) {
      wx.showLoading({ title: '删除中...' })
      try {
        await deleteTask(this.data.taskId)
        wx.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => wx.navigateBack(), 1500)
      } catch (error) {
        console.error('Failed to delete task:', error)
        wx.showToast({ title: '删除失败', icon: 'none' })
      } finally {
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
