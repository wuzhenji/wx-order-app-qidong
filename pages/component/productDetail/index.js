Component({
  properties: {
    productDetail: {
      type: Object,
      value: {}
    }
  },
  data: {
  },
  methods: {
    closeDetail() {
      this.triggerEvent('close')
    }
  }
})
