Component({
  properties: {
    text: {
      type: String,
      value: ''
    }
  },
  data: {

  },
  methods: {
    handleClose() {
      this.triggerEvent("close")
    }
  }
})
