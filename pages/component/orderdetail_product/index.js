Component({
  properties: {
    productdetail: {
      type: Object,
      default() {
        return {}
      }
    },
    orderDetail: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data: {

  },
  methods: {
    closeDetail() {
      this.triggerEvent('close')
    },
  }
})