// components/habit-create/habit-create.ts
Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },

  data: {
    name: '',
    selectedIcon: '💪',
    icons: ['💪', '📚', '🏃', '🧘', '💧', '🌅', '🎨', '✍️', '🎵', '🍎', '😴', '💊'],
    frequency: 'daily',
    reminder: ''
  },

  methods: {
    onStopPropagation() {
      // Prevent event bubbling
    },

    onNameInput(e: WechatMiniprogram.CustomEvent) {
      this.setData({ name: e.detail.value })
    },

    onSelectIcon(e: WechatMiniprogram.CustomEvent) {
      const { icon } = e.currentTarget.dataset
      this.setData({ selectedIcon: icon })
    },

    onSelectFrequency(e: WechatMiniprogram.CustomEvent) {
      const { freq } = e.currentTarget.dataset
      this.setData({ frequency: freq })
    },

    onReminderInput(e: WechatMiniprogram.CustomEvent) {
      this.setData({ reminder: e.detail.value })
    },

    onCancel() {
      this.resetForm()
      this.triggerEvent('cancel')
    },

    onConfirm() {
      if (!this.data.name.trim()) {
        wx.showToast({ title: '请输入习惯名称', icon: 'none' })
        return
      }

      const habit = {
        name: this.data.name,
        icon: this.data.selectedIcon,
        frequency: this.data.frequency,
        reminder: this.data.reminder
      }

      this.triggerEvent('confirm', { habit })
      this.resetForm()
    },

    resetForm() {
      this.setData({
        name: '',
        selectedIcon: '💪',
        frequency: 'daily',
        reminder: ''
      })
    }
  }
})
