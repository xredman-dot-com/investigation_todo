import { initPageTheme } from "../../../core/themeMixin"

type CountdownItem = {
  id: string
  title: string
  targetDate: string
  createdAt: string
}

type CountdownDisplayItem = CountdownItem & {
  displayDate: string
  daysLeft: number
  dayNumber: number
  badgeText: string
  toneClass: string
}

type Summary = {
  total: number
  upcoming: number
  passed: number
  nextTitle: string
  nextDays: number
}

const STORAGE_KEY = "countdownItems"

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
    form: {
      title: "",
      date: ""
    }
  },

  onShow() {
    initPageTheme(this)
    this.loadItems()
  },

  onPullDownRefresh() {
    this.loadItems()
    wx.stopPullDownRefresh()
  },

  loadItems() {
    const raw = wx.getStorageSync(STORAGE_KEY) || []
    const items = this.normalizeItems(raw as CountdownItem[])
    this.setData({
      items,
      summary: this.buildSummary(items)
    })
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    this.setData({ "form.title": e.detail.value })
  },

  onDateChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({ "form.date": e.detail.value })
  },

  addItem() {
    const title = this.data.form.title.trim()
    const date = this.data.form.date
    if (!title) {
      wx.showToast({ title: "请输入标题", icon: "none" })
      return
    }
    if (!date) {
      wx.showToast({ title: "请选择日期", icon: "none" })
      return
    }
    const items = this.getStoredItems()
    const newItem: CountdownItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      targetDate: date,
      createdAt: new Date().toISOString()
    }
    const nextItems = [newItem, ...items]
    this.saveItems(nextItems)
    this.setData({ form: { title: "", date: "" } })
    this.loadItems()
  },

  removeItem(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.showModal({
      title: "删除倒数日",
      content: "确定删除该倒数日吗？",
      success: (res) => {
        if (!res.confirm) return
        const items = this.getStoredItems().filter((item) => item.id !== id)
        this.saveItems(items)
        this.loadItems()
      }
    })
  },

  getStoredItems(): CountdownItem[] {
    return (wx.getStorageSync(STORAGE_KEY) || []) as CountdownItem[]
  },

  saveItems(items: CountdownItem[]) {
    wx.setStorageSync(STORAGE_KEY, items)
  },

  normalizeItems(items: CountdownItem[]): CountdownDisplayItem[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const normalized = items.map((item) => {
      const target = new Date(`${item.targetDate}T00:00:00`)
      const diffMs = target.getTime() - today.getTime()
      const daysLeft = Math.floor(diffMs / 86400000)
      const dayNumber = Math.abs(daysLeft)
      return {
        ...item,
        displayDate: formatDisplayDate(item.targetDate),
        daysLeft,
        dayNumber,
        badgeText: daysLeft >= 0 ? `还有 ${dayNumber} 天` : `已过 ${dayNumber} 天`,
        toneClass: daysLeft >= 0 ? "upcoming" : "passed"
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
  }
})
