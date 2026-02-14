import { initPageTheme } from "../../../core/themeMixin"
import { getLunarDate } from "../../calendar/utils/lunar"
import { createCountdown, deleteCountdown, listCountdowns } from "../services"
import type { CountdownItem } from "../../../types/api"

type CountdownDisplayItem = CountdownItem & {
  displayDate: string
  calendarLabel: string
  daysLeft: number
  dayNumber: number
  badgeText: string
  toneClass: string
  typeLabel: string
  typeClass: string
}

type Summary = {
  total: number
  upcoming: number
  passed: number
  nextTitle: string
  nextDays: number
}

function formatDisplayDate(value: string): string {
  const [year, month, day] = value.split("-")
  return `${year}.${month}.${day}`
}

Page({
  data: {
    items: [] as CountdownDisplayItem[],
    summary: {
      total: 0,
      upcoming: 0,
      passed: 0,
      nextTitle: "",
      nextDays: 0
    } as Summary,
    showForm: false,
    form: {
      title: "",
      date: "",
      type: "countdown",
      calendarType: "solar"
    },
    isLoading: false,
    errorMessage: ""
  },

  onShow() {
    initPageTheme(this)
    this.fetchItems()
  },

  onPullDownRefresh() {
    this.fetchItems(true)
    wx.stopPullDownRefresh()
  },

  async fetchItems(forceRefresh = false) {
    if (!forceRefresh && this.data.items.length) return
    this.setData({ isLoading: true, errorMessage: "" })
    try {
      const items = await listCountdowns()
      const normalized = this.normalizeItems(items)
      this.setData({
        items: normalized,
        summary: this.buildSummary(normalized),
        isLoading: false
      })
    } catch (error) {
      this.setData({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : "加载失败"
      })
    }
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    this.setData({ "form.title": e.detail.value })
  },

  onDateChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ "form.date": e.detail.value })
  },

  onTypeSelect(e: WechatMiniprogram.CustomEvent) {
    this.setData({ "form.type": e.currentTarget.dataset.value })
  },

  onCalendarSelect(e: WechatMiniprogram.CustomEvent) {
    this.setData({ "form.calendarType": e.currentTarget.dataset.value })
  },

  openForm() {
    this.setData({ showForm: true })
  },

  closeForm() {
    this.setData({ showForm: false })
  },

  addItem() {
    const title = this.data.form.title.trim()
    const date = this.data.form.date
    const type = this.data.form.type || "countdown"
    const calendarType = this.data.form.calendarType || "solar"
    if (!title) {
      wx.showToast({ title: "请输入标题", icon: "none" })
      return
    }
    if (!date) {
      wx.showToast({ title: "请选择日期", icon: "none" })
      return
    }
    let targetDate = date
    let lunarMonth: number | null = null
    let lunarDay: number | null = null
    if (calendarType === "lunar") {
      const [year, month, day] = date.split("-").map((value) => Number(value))
      lunarMonth = month
      lunarDay = day
      targetDate = this.findNextLunarDate(lunarMonth, lunarDay, year)
    }
    this.setData({ isLoading: true, errorMessage: "" })
    createCountdown({
      title,
      target_date: targetDate,
      type,
      calendar_type: calendarType,
      lunar_month: lunarMonth,
      lunar_day: lunarDay
    })
      .then(() => {
        this.setData({
          form: { title: "", date: "", type: "countdown", calendarType: "solar" },
          showForm: false
        })
        this.fetchItems(true)
      })
      .catch((error) => {
        this.setData({
          isLoading: false,
          errorMessage: error instanceof Error ? error.message : "创建失败"
        })
      })
  },

  removeItem(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.showModal({
      title: "删除倒数日",
      content: "确定删除该倒数日吗？",
      success: (res) => {
        if (!res.confirm) return
        this.setData({ isLoading: true, errorMessage: "" })
        deleteCountdown(id)
          .then(() => this.fetchItems(true))
          .catch((error) => {
            this.setData({
              isLoading: false,
              errorMessage: error instanceof Error ? error.message : "删除失败"
            })
          })
      }
    })
  },

  normalizeItems(items: CountdownItem[]): CountdownDisplayItem[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const normalized = items.map((item) => {
      const calendarType = item.calendar_type || "solar"
      const typeValue = item.type || "countdown"
      const effectiveTargetDate = calendarType === "lunar" && item.lunar_month && item.lunar_day
        ? this.findNextLunarDate(item.lunar_month, item.lunar_day, new Date().getFullYear())
        : item.target_date
      const target = new Date(`${effectiveTargetDate}T00:00:00`)
      const diffMs = target.getTime() - today.getTime()
      const daysLeft = Math.floor(diffMs / 86400000)
      const dayNumber = Math.abs(daysLeft)
      const displayDate = calendarType === "lunar" && item.lunar_month && item.lunar_day
        ? `农历 ${item.lunar_month}月${item.lunar_day}日`
        : formatDisplayDate(item.target_date)
      const typeLabel = this.getTypeLabel(typeValue)
      return {
        ...item,
        displayDate,
        calendarLabel: calendarType === "lunar" ? "农历" : "公历",
        daysLeft,
        dayNumber,
        badgeText: daysLeft >= 0 ? `还有 ${dayNumber} 天` : `已过 ${dayNumber} 天`,
        toneClass: daysLeft >= 0 ? "upcoming" : "passed",
        typeLabel,
        typeClass: `type-${typeValue}`
      }
    })
    return normalized.sort((a, b) => a.targetDate.localeCompare(b.targetDate))
  },

  buildSummary(items: CountdownDisplayItem[]): Summary {
    const total = items.length
    const upcomingItems = items.filter((item) => item.daysLeft >= 0)
    const passedItems = items.filter((item) => item.daysLeft < 0)
    const nextItem = upcomingItems.sort((a, b) => a.daysLeft - b.daysLeft)[0]
    return {
      total,
      upcoming: upcomingItems.length,
      passed: passedItems.length,
      nextTitle: nextItem ? nextItem.title : "暂无",
      nextDays: nextItem ? nextItem.dayNumber : 0
    }
  },

  getTypeLabel(value: string): string {
    switch (value) {
      case "birthday":
        return "生日"
      case "anniversary":
        return "纪念日"
      case "festival":
        return "节日"
      default:
        return "倒数日"
    }
  },

  findNextLunarDate(month: number, day: number, yearHint: number) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startYear = yearHint || today.getFullYear()
    const maxDays = 400
    for (let offset = 0; offset <= maxDays; offset++) {
      const candidate = new Date(today)
      candidate.setDate(today.getDate() + offset)
      const lunar = getLunarDate(candidate)
      if (!lunar) continue
      if (!lunar.isLeap && lunar.month === month && lunar.day === day) {
        return formatDisplayDateCandidate(candidate)
      }
    }
    const fallback = new Date(startYear, month - 1, day)
    return formatDisplayDateCandidate(fallback)
  }
})

function formatDisplayDateCandidate(value: Date): string {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
