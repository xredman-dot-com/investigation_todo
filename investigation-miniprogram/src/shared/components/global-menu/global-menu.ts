import { getSessionSnapshot } from "../../../core/session"
import { listLists } from "../../../services/lists"
import { listFilters } from "../../../services/filters"
import type { ListItem, FilterItem } from "../../../types/api"

type MenuItem = {
  label: string
  icon: string
  url?: string
  action?: "about" | "taskView" | "taskList" | "taskFilter" | "calendarView" | "pomodoroMode" | "countdownType"
  payload?: Record<string, string>
}

type MenuSection = {
  title: string
  items: MenuItem[]
}

type MenuContext = "tasks" | "calendar" | "countdown" | "pomodoro" | "habits" | "settings"

Component({
  properties: {
    inline: {
      type: Boolean,
      value: false
    },
    context: {
      type: String,
      value: ""
    }
  },
  data: {
    open: false,
    userName: "未登录",
    menuAvatar: "/assets/icons/menu-user.png",
    sections: [] as MenuSection[],
    lists: [] as ListItem[],
    filters: [] as FilterItem[],
    resolvedContext: "tasks" as MenuContext
  },

  lifetimes: {
    attached() {
      const resolvedContext = this.resolveContext()
      this.refreshUser()
      this.setData({ resolvedContext })
      this.loadContextData(resolvedContext)
    }
  },

  methods: {
    resolveContext(): MenuContext {
      if (this.properties.context) {
        return this.properties.context as MenuContext
      }
      const pages = getCurrentPages()
      const route = pages[pages.length - 1]?.route || ""
      if (route.includes("tasks/pages")) return "tasks"
      if (route.includes("calendar/pages")) return "calendar"
      if (route.includes("countdown/pages")) return "countdown"
      if (route.includes("pomodoro/pages")) return "pomodoro"
      if (route.includes("habits/pages")) return "habits"
      return "settings"
    },
    async loadContextData(context: MenuContext) {
      if (context === "tasks") {
        try {
          const [lists, filters] = await Promise.all([listLists(), listFilters()])
          this.setData({ lists, filters })
        } catch (error) {
          this.setData({ lists: [], filters: [] })
        }
      }
      this.setData({ sections: this.buildSections(context) })
    },
    buildSections(context: MenuContext): MenuSection[] {
      if (context === "tasks") {
        return this.buildTaskSections()
      }
      if (context === "calendar") {
        return [
          {
            title: "视图",
            items: [
              { label: "月视图", icon: "/assets/icons/menu-calendar.png", action: "calendarView", payload: { view: "month" } },
              { label: "周视图", icon: "/assets/icons/menu-calendar.png", action: "calendarView", payload: { view: "week" } },
              { label: "日视图", icon: "/assets/icons/menu-calendar.png", action: "calendarView", payload: { view: "day" } }
            ]
          },
          {
            title: "设置",
            items: [
              { label: "日历显示设置", icon: "/assets/icons/menu-calendar.png", url: "/features/settings/pages/calendar/calendar" }
            ]
          }
        ]
      }
      if (context === "countdown") {
        return [
          {
            title: "倒数日",
            items: [
              { label: "全部倒数日", icon: "/assets/icons/menu-calendar.png", action: "countdownType", payload: { type: "all" } },
              { label: "倒数", icon: "/assets/icons/menu-calendar.png", action: "countdownType", payload: { type: "countdown" } },
              { label: "纪念日", icon: "/assets/icons/menu-calendar.png", action: "countdownType", payload: { type: "anniversary" } }
            ]
          }
        ]
      }
      if (context === "pomodoro") {
        return [
          {
            title: "专注模式",
            items: [
              { label: "番茄专注", icon: "/assets/icons/menu-pomodoro.png", action: "pomodoroMode", payload: { mode: "pomodoro" } },
              { label: "正计时", icon: "/assets/icons/menu-pomodoro.png", action: "pomodoroMode", payload: { mode: "countup" } }
            ]
          },
          {
            title: "设置",
            items: [
              { label: "番茄钟设置", icon: "/assets/icons/menu-pomodoro.png", url: "/features/settings/pages/pomodoro/pomodoro" }
            ]
          }
        ]
      }
      if (context === "habits") {
        return [
          {
            title: "习惯",
            items: [
              { label: "习惯打卡", icon: "/assets/icons/menu-bell.png", url: "/features/habits/pages/index" }
            ]
          }
        ]
      }
      return [
        {
          title: "设置",
          items: [
            { label: "个人中心", icon: "/assets/icons/menu-user.png", url: "/features/settings/pages/settings" }
          ]
        }
      ]
    },
    buildTaskSections(): MenuSection[] {
      const smartItems: MenuItem[] = [
        { label: "今天", icon: "/assets/icons/menu-calendar.png", action: "taskView", payload: { view: "today" } },
        { label: "明天", icon: "/assets/icons/menu-calendar.png", action: "taskView", payload: { view: "tomorrow" } },
        { label: "最近七天", icon: "/assets/icons/menu-calendar.png", action: "taskView", payload: { view: "next7" } },
        { label: "收集箱", icon: "/assets/icons/menu-folder.png", action: "taskView", payload: { view: "inbox" } },
        { label: "全部任务", icon: "/assets/icons/menu-folder.png", action: "taskView", payload: { view: "all" } }
      ]
      const orderedLists = [...this.data.lists].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const listItems = orderedLists.map((list) => ({
        label: list.name === "Inbox" ? "收集箱" : list.name,
        icon: "/assets/icons/menu-folder.png",
        action: "taskList" as const,
        payload: { listId: list.id }
      }))
      const orderedFilters = [...this.data.filters].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const filterItems = orderedFilters.map((filter) => ({
        label: filter.name,
        icon: "/assets/icons/menu-bell.png",
        action: "taskFilter" as const,
        payload: { filterId: filter.id, filterName: filter.name }
      }))
      return [
        { title: "智能清单", items: smartItems },
        { title: "清单", items: listItems.length ? listItems : [{ label: "暂无清单", icon: "/assets/icons/menu-folder.png" }] },
        { title: "过滤器", items: filterItems.length ? filterItems : [{ label: "暂无过滤器", icon: "/assets/icons/menu-bell.png" }] },
        {
          title: "视图",
          items: [
            { label: "时间线视图", icon: "/assets/icons/menu-calendar.png", url: "/features/views/pages/timeline/timeline" },
            { label: "四象限", icon: "/assets/icons/menu-calendar.png", url: "/features/views/pages/eisenhower/eisenhower" }
          ]
        },
        {
          title: "管理",
          items: [
            { label: "清单管理", icon: "/assets/icons/menu-folder.png", url: "/features/settings/pages/index" },
            { label: "个人中心", icon: "/assets/icons/menu-user.png", url: "/features/settings/pages/settings" }
          ]
        }
      ]
    },
    refreshUser() {
      const snapshot = getSessionSnapshot()
      const user = snapshot.user
      const nickname =
        user?.nickname ||
        (user?.openid ? `用户-${user.openid.slice(-4)}` : "") ||
        (user?.id ? `用户-${user.id.slice(-4)}` : "")
      const avatar = user?.avatar_url || ""
      this.setData({
        userName: nickname || "未登录",
        menuAvatar: avatar || "/assets/icons/menu-user.png"
      })
    },
    toggleMenu() {
      if (!this.data.open) {
        this.refreshUser()
        this.loadContextData(this.data.resolvedContext)
      }
      this.setData({ open: !this.data.open })
    },
    closeMenu() {
      this.setData({ open: false })
    },
    onItemTap(e: WechatMiniprogram.CustomEvent) {
      const { url, action, payload } = e.currentTarget.dataset as {
        url?: string
        action?: string
        payload?: Record<string, string>
      }
      if (action === "about") {
        wx.showModal({
          title: "关于格物清单",
          content: "格物清单是一款简洁高效的任务管理应用\n版本：1.0.0",
          showCancel: false
        })
        return
      }
      if (action === "taskView") {
        wx.setStorageSync("menu:taskView", { view: payload?.view })
        this.applySelectionToCurrentPage()
        wx.switchTab({ url: "/features/tasks/pages/list/list" })
        this.closeMenu()
        return
      }
      if (action === "taskList") {
        wx.setStorageSync("menu:taskView", { view: "list", listId: payload?.listId })
        this.applySelectionToCurrentPage()
        wx.switchTab({ url: "/features/tasks/pages/list/list" })
        this.closeMenu()
        return
      }
      if (action === "taskFilter") {
        wx.setStorageSync("menu:taskView", { view: "filter", filterId: payload?.filterId, filterName: payload?.filterName })
        this.applySelectionToCurrentPage()
        wx.switchTab({ url: "/features/tasks/pages/list/list" })
        this.closeMenu()
        return
      }
      if (action === "calendarView") {
        wx.setStorageSync("menu:calendarView", { view: payload?.view })
        this.applySelectionToCurrentPage()
        wx.switchTab({ url: "/features/calendar/pages/calendar" })
        this.closeMenu()
        return
      }
      if (action === "pomodoroMode") {
        wx.setStorageSync("menu:pomodoroMode", { mode: payload?.mode })
        this.applySelectionToCurrentPage()
        wx.switchTab({ url: "/features/pomodoro/pages/index" })
        this.closeMenu()
        return
      }
      if (action === "countdownType") {
        wx.setStorageSync("menu:countdownType", { type: payload?.type })
        this.applySelectionToCurrentPage()
        wx.switchTab({ url: "/features/countdown/pages/index" })
        this.closeMenu()
        return
      }
      if (url) {
        if (this.isTabPage(url)) {
          wx.switchTab({ url })
        } else {
          wx.navigateTo({ url })
        }
      }
      this.closeMenu()
    },
    isTabPage(url: string) {
      const tabPages = [
        "/features/tasks/pages/list/list",
        "/features/calendar/pages/calendar",
        "/features/countdown/pages/index",
        "/features/pomodoro/pages/index",
        "/features/habits/pages/index"
      ]
      return tabPages.includes(url)
    },
    applySelectionToCurrentPage() {
      const pages = getCurrentPages()
      const current = pages[pages.length - 1] as { route?: string; applyMenuSelection?: () => void }
      if (current?.applyMenuSelection) {
        current.applyMenuSelection()
      }
    }
  }
})
