type MenuItem = {
  label: string
  icon: string
  url?: string
  action?: "about"
}

type MenuSection = {
  title: string
  items: MenuItem[]
}

Component({
  properties: {
    inline: {
      type: Boolean,
      value: false
    }
  },
  data: {
    open: false,
    userName: "未登录",
    sections: [] as MenuSection[]
  },

  lifetimes: {
    attached() {
      const userInfo = wx.getStorageSync("userInfo") || {}
      const name = userInfo.name || userInfo.nickname || "未登录"
      this.setData({
        userName: name,
        sections: [
          {
            title: "我的",
            items: [
              { label: "个人中心", icon: "👤", url: "/features/settings/pages/settings" },
              { label: "清单管理", icon: "📁", url: "/features/settings/pages/index" }
            ]
          },
          {
            title: "设置",
            items: [
              { label: "提醒设置", icon: "🔔", url: "/features/settings/pages/notification/notification" },
              { label: "番茄钟设置", icon: "🍅", url: "/features/settings/pages/pomodoro/pomodoro" },
              { label: "日历设置", icon: "📅", url: "/features/settings/pages/calendar/calendar" }
            ]
          },
          {
            title: "更多",
            items: [
              { label: "关于格物清单", icon: "ℹ️", action: "about" }
            ]
          }
        ]
      })
    }
  },

  methods: {
    toggleMenu() {
      this.setData({ open: !this.data.open })
    },
    closeMenu() {
      this.setData({ open: false })
    },
    onItemTap(e: WechatMiniprogram.CustomEvent) {
      const { url, action } = e.currentTarget.dataset as { url?: string; action?: string }
      if (action === "about") {
        wx.showModal({
          title: "关于格物清单",
          content: "格物清单是一款简洁高效的任务管理应用\n版本：1.0.0",
          showCancel: false
        })
        return
      }
      if (url) {
        wx.navigateTo({ url })
      }
      this.closeMenu()
    }
  }
})
