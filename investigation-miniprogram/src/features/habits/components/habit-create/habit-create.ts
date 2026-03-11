Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    name: "",
    frequency: "daily",
    targetCount: "1",
    reminder: ""
  },

  methods: {
    onStopPropagation() {},

    onNameInput(e: WechatMiniprogram.CustomEvent) {
      this.setData({ name: e.detail.value })
    },

    onSelectFrequency(e: WechatMiniprogram.CustomEvent) {
      const { freq } = e.currentTarget.dataset
      this.setData({ frequency: freq })
    },

    onTargetCountInput(e: WechatMiniprogram.CustomEvent) {
      this.setData({ targetCount: e.detail.value })
    },

    onReminderInput(e: WechatMiniprogram.CustomEvent) {
      this.setData({ reminder: e.detail.value })
    },

    onCancel() {
      this.resetForm()
      this.triggerEvent("cancel")
    },

    onConfirm() {
      if (!this.data.name.trim()) {
        wx.showToast({ title: "请输入习惯名称", icon: "none" })
        return
      }

      this.triggerEvent("confirm", {
        habit: {
          name: this.data.name.trim(),
          frequency: this.data.frequency,
          target_count: Number(this.data.targetCount) || 1,
          reminder_time: this.data.reminder.trim()
        }
      })
      this.resetForm()
    },

    resetForm() {
      this.setData({
        name: "",
        frequency: "daily",
        targetCount: "1",
        reminder: ""
      })
    }
  }
})
