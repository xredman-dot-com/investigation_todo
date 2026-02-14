// pages/calendar/calendar.ts
// 参考滴答清单设计：日/周/月三视图切换
import { initPageTheme } from "../../../core/themeMixin"
import { listTasks } from '../services'
import type { TaskItem } from '../model'
import { calendarStore } from "../../../stores/calendar"

type ViewMode = 'month' | 'week' | 'day'

interface DayInfo {
  date: number
  fullDate: string // YYYY-MM-DD
  isToday: boolean
  isCurrentMonth: boolean
  tasks: TaskItem[]
}

interface WeekInfo {
  weekNumber: number
  days: DayInfo[]
}

Page({
  data: {
    // 视图模式
    viewMode: 'month' as ViewMode,
    
    // 当前显示的基准日期（月视图=该月第一天，周视图=该周第一天，日视图=当天）
    currentDate: new Date().toISOString(),
    
    // 选中的日期
    selectedDate: new Date().toISOString(),
    
    // 星期标题
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    
    // 月视图数据
    monthDays: [] as DayInfo[][], // 按周分组
    currentMonthTitle: '', // 例如：2026年2月
    
    // 周视图数据
    weekDaysList: [] as DayInfo[],
    weekRangeTitle: '', // 例如：2月10日 - 2月16日
    
    // 日视图数据
    dayTasks: [] as TaskItem[],
    dayAllDayTasks: [] as TaskItem[], // 全天任务（无时间）
    dayTimedTasks: [] as TaskItem[], // 有时间任务
    timeSlots: [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
    
    // 选中日期任务列表（底部显示）
    selectedDateTasks: [] as TaskItem[],
    selectedDateTitle: '', // 例如：今天、明天、2月13日
    
    // 加载状态
    isLoading: false,
    errorMessage: ''
  },

  onLoad() {
    initPageTheme(this)
    this.initializeDate()
    this.loadCalendarData()
  },

  onShow() {
    initPageTheme(this)
    this.loadCalendarData()
  },

  // 初始化日期
  initializeDate() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()
    
    this.setData({
      currentDate: todayStr,
      selectedDate: todayStr
    })
  },

  // 切换视图模式
  onViewModeChange(e: WechatMiniprogram.CustomEvent) {
    const mode = e.currentTarget.dataset.mode as ViewMode
    this.setData({ viewMode: mode }, () => {
      this.loadCalendarData()
    })
  },

  // 加载日历数据
  async loadCalendarData() {
    const { viewMode } = this.data
    
    // 先生成日历结构
    if (viewMode === 'month') {
      this.generateMonthView()
    } else if (viewMode === 'week') {
      this.generateWeekView()
    } else if (viewMode === 'day') {
      this.generateDayView()
    }
    
    // 加载任务数据
    await this.loadTasksForRange()
  },

  // 生成月视图
  generateMonthView() {
    const currentDate = new Date(this.data.currentDate)
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // 设置标题
    const monthTitle = `${year}年${month + 1}月`
    
    // 获取该月第一天和最后一天
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // 获取第一天是星期几（0=周日）
    const startWeekday = firstDay.getDay()
    
    // 生成该月的所有日期（包括前后月填充）
    const weeks: DayInfo[][] = []
    let currentWeek: DayInfo[] = []
    
    // 填充前月日期
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startWeekday - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i
      const fullDate = this.formatDateStr(new Date(year, month - 1, date))
      currentWeek.push({
        date,
        fullDate,
        isToday: false,
        isCurrentMonth: false,
        tasks: []
      })
    }
    
    // 填充当月日期
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day)
      const fullDate = this.formatDateStr(dateObj)
      
      currentWeek.push({
        date: day,
        fullDate,
        isToday: dateObj.getTime() === today.getTime(),
        isCurrentMonth: true,
        tasks: []
      })
      
      // 每周结束或月末
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    // 填充下月日期
    let nextMonthDay = 1
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      const fullDate = this.formatDateStr(new Date(year, month + 1, nextMonthDay))
      currentWeek.push({
        date: nextMonthDay,
        fullDate,
        isToday: false,
        isCurrentMonth: false,
        tasks: []
      })
      nextMonthDay++
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    this.setData({
      monthDays: weeks,
      currentMonthTitle: monthTitle
    })
  },

  // 生成周视图
  generateWeekView() {
    const currentDate = new Date(this.data.currentDate)
    const weekStart = this.getWeekStart(currentDate)
    
    const weekDays: DayInfo[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(weekStart)
      dateObj.setDate(weekStart.getDate() + i)
      
      weekDays.push({
        date: dateObj.getDate(),
        fullDate: this.formatDateStr(dateObj),
        isToday: dateObj.getTime() === today.getTime(),
        isCurrentMonth: dateObj.getMonth() === currentDate.getMonth(),
        tasks: []
      })
    }
    
    // 设置周范围标题
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const weekTitle = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`
    
    this.setData({
      weekDaysList: weekDays,
      weekRangeTitle: weekTitle
    })
  },

  // 生成日视图
  generateDayView() {
    const currentDate = new Date(this.data.currentDate)
    const fullDate = this.formatDateStr(currentDate)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    this.setData({
      currentMonthTitle: `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`,
      selectedDate: currentDate.toISOString()
    })
  },

  // 加载日期范围内的任务
  async loadTasksForRange() {
    const { viewMode, currentDate } = this.data
    
    let startDate: Date
    let endDate: Date
    
    if (viewMode === 'month') {
      const date = new Date(currentDate)
      startDate = new Date(date.getFullYear(), date.getMonth(), 1)
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    } else if (viewMode === 'week') {
      const date = new Date(currentDate)
      startDate = this.getWeekStart(date)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
    } else {
      // day view
      startDate = new Date(currentDate)
      endDate = new Date(currentDate)
    }
    
    const startStr = this.formatDateStr(startDate)
    const endStr = this.formatDateStr(endDate)
    
    this.setData({ isLoading: true, errorMessage: '' })
    
    try {
      const tasks = await listTasks({ 
        due_date_from: startStr, 
        due_date_to: endStr 
      }) as TaskItem[]
      
      // 按日期分组任务
      const tasksByDate: Record<string, TaskItem[]> = {}
      tasks.forEach(task => {
        if (task.due_date) {
          if (!tasksByDate[task.due_date]) {
            tasksByDate[task.due_date] = []
          }
          tasksByDate[task.due_date].push(task)
        }
      })
      
      // 更新日历数据中的任务
      this.updateCalendarWithTasks(tasksByDate)
      
      // 更新选中日期的任务列表
      this.updateSelectedDateTasks()
      
      this.setData({ isLoading: false })
    } catch (error) {
      console.error('Failed to load tasks:', error)
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : '加载失败'
      })
    }
  },

  // 更新日历数据中的任务
  updateCalendarWithTasks(tasksByDate: Record<string, TaskItem[]>) {
    const { viewMode } = this.data
    
    if (viewMode === 'month') {
      const monthDays = this.data.monthDays.map(week => 
        week.map(day => ({
          ...day,
          tasks: tasksByDate[day.fullDate] || []
        }))
      )
      this.setData({ monthDays })
    } else if (viewMode === 'week') {
      const weekDaysList = this.data.weekDaysList.map(day => ({
        ...day,
        tasks: tasksByDate[day.fullDate] || []
      }))
      this.setData({ weekDaysList })
    }
  },

  // 更新选中日期的任务
  updateSelectedDateTasks() {
    const selectedDate = new Date(this.data.selectedDate)
    const dateStr = this.formatDateStr(selectedDate)
    
    // 从已加载的数据中获取任务
    const { monthDays, weekDaysList, viewMode } = this.data
    let tasks: TaskItem[] = []
    
    if (viewMode === 'month') {
      for (const week of monthDays) {
        for (const day of week) {
          if (day.fullDate === dateStr) {
            tasks = day.tasks
            break
          }
        }
      }
    } else if (viewMode === 'week') {
      for (const day of weekDaysList) {
        if (day.fullDate === dateStr) {
          tasks = day.tasks
          break
        }
      }
    }
    
    // 设置选中日期标题
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    let title: string
    if (selectedDate.getTime() === today.getTime()) {
      title = '今天'
    } else if (selectedDate.getTime() === tomorrow.getTime()) {
      title = '明天'
    } else {
      title = `${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`
    }
    
    this.setData({
      selectedDateTasks: tasks,
      selectedDateTitle: title,
      dayTasks: tasks
    })
  },

  // 点击日期
  onDayTap(e: WechatMiniprogram.CustomEvent) {
    const { fullDate } = e.currentTarget.dataset
    const dateObj = new Date(fullDate + 'T00:00:00')
    
    this.setData({
      selectedDate: dateObj.toISOString()
    }, () => {
      this.updateSelectedDateTasks()
    })
  },

  // 切换到上一页（月/周/日）
  onPrevPage() {
    const { viewMode, currentDate } = this.data
    const date = new Date(currentDate)
    
    if (viewMode === 'month') {
      date.setMonth(date.getMonth() - 1)
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - 7)
    } else {
      date.setDate(date.getDate() - 1)
    }
    
    this.setData({ currentDate: date.toISOString() }, () => {
      this.loadCalendarData()
    })
  },

  // 切换到下一页（月/周/日）
  onNextPage() {
    const { viewMode, currentDate } = this.data
    const date = new Date(currentDate)
    
    if (viewMode === 'month') {
      date.setMonth(date.getMonth() + 1)
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + 7)
    } else {
      date.setDate(date.getDate() + 1)
    }
    
    this.setData({ currentDate: date.toISOString() }, () => {
      this.loadCalendarData()
    })
  },

  // 回到今天
  onGoToday() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()
    
    this.setData({
      currentDate: todayStr,
      selectedDate: todayStr
    }, () => {
      this.loadCalendarData()
    })
  },

  // 点击任务
  onTaskTap(e: WechatMiniprogram.CustomEvent) {
    const { taskId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/features/tasks/pages/detail/detail?id=${taskId}`
    })
  },

  // 添加任务
  onAddTask() {
    const selectedDate = this.formatDateStr(new Date(this.data.selectedDate))
    wx.navigateTo({
      url: `/features/tasks/pages/create/create?dueDate=${selectedDate}`
    })
  },

  // 工具函数：获取周开始（周日）
  getWeekStart(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  },

  // 工具函数：格式化日期为 YYYY-MM-DD
  formatDateStr(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
})
