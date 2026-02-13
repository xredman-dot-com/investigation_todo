Component({
  properties: {
    message: {
      type: String,
      value: ""
    },
    type: {
      type: String,
      value: "info"
    },
    actionText: {
      type: String,
      value: ""
    }
  },
  methods: {
    onAction() {
      this.triggerEvent("action")
    }
  }
})
