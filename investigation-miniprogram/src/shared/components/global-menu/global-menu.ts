import { settingsStore } from "../../../stores/settings"

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
    menuAvatar: "/assets/icons/menu-user.png",
    sections: [] as MenuSection[]
  },

  lifetimes: {
    attached() {
      this.refreshUser()
      this.setData({
        sections: [
          {
            title: "我的",
            items: [
              { label: "个人中心", icon: "/assets/icons/menu-user.png", url: "/features/settings/pages/settings" },
              { label: "清单管理", icon: "/assets/icons/menu-folder.png", url: "/features/settings/pages/index" }
            ]
          },
          {
            title: "设置",
            items: [
              { label: "提醒设置", icon: "/assets/icons/menu-bell.png", url: "/features/settings/pages/notification/notification" },
              { label: "番茄钟设置", icon: "/assets/icons/menu-pomodoro.png", url: "/features/settings/pages/pomodoro/pomodoro" },
              { label: "日历设置", icon: "/assets/icons/menu-calendar.png", url: "/features/settings/pages/calendar/calendar" }
            ]
          },
          {
            title: "更多",
            items: [
              { label: "关于格物清单", icon: "/assets/icons/menu-info.png", action: "about" }
            ]
          }
        ]
      })
    }
  },

  methods: {
    refreshUser() {
      const storeUser = settingsStore.getState().user
      const app = getApp<{ globalData: { user: { nickname?: string; avatar_url?: string; openid?: string } | null } }>()
      const globalUser = app.globalData?.user || null
      const userInfo = wx.getStorageSync("userInfo") || {}
      const nickname =
        storeUser?.nickname ||
        globalUser?.nickname ||
        userInfo.nickname ||
        userInfo.name ||
        (globalUser?.openid ? `用户-${globalUser.openid.slice(-4)}` : "")
      const avatar = storeUser?.avatar_url || globalUser?.avatar_url || userInfo.avatar_url
      console.log("[Menu] refreshUser", { storeUser, globalUser, userInfo })
      this.setData({
        userName: nickname || "未登录",
        menuAvatar: avatar || "/assets/icons/menu-user.png"
      })
    },
    toggleMenu() {
      if (!this.data.open) {
        this.refreshUser()
      }
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
