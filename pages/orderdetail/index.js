const app = getApp()
const $api = require('../../utils/request').API;
const {floatObj} = require('../../utils/util')
Component({
  properties: {

  },
  data: {
    showProductDetail: false,
    productdetail: {},
    baseURL: app.gData.baseURL,
    statusBarHeight: 0,
    orderDetail: {},
    statusList: [{
      name: '待付款',
      type: 0,
    }, {
      name: '待取货',
      type: 1,
    }, {
      name: '待送货',
      type: 2,
    }, {
      name: '已完结',
      type: 3,
    }, {
      name: '已取消',
      type: 4,
    }, ],
  },
  methods: {
    handleShowProductDetail(e) {
      this.setData({
        showProductDetail: true,
        productdetail: e.currentTarget.dataset.productdetail
      })
    },
    handleCloseDetail() {
      this.setData({
        showProductDetail: false
      })
    },
    handleBack() {
      wx.navigateBack()
    },
    // getOrderDetail() {
    //   $api.getOrderDetailAPI({
    //     orderId: this.data.orderId
    //   }).then(res => {
    //     console.log(res)
    //     this.setData({
    //       orderDetail: res.data
    //     })
    //   }).catch(err => {
    //     console.log(err)
    //   })
    // },
  },
  pageLifetimes: {
    show() {
      let _this = this
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('getOrderDetail', function (orderDetail) {
        let product_a = []
        let product_b = []
        if(orderDetail.orderDetailList){
          product_a = orderDetail.orderDetailList.filter(v => {
          return v.pickDis == 0
        }).map(v => ({singlePriceAll: floatObj().multiply(v.productPrice, v.productQuantity), ...v})) // 自取
          // product_a = orderDetail.orderDetailList.filter(v => {return v.pickDis == 0}) // 自取
          product_b = orderDetail.orderDetailList.filter(v => {return v.pickDis == 1}) // 配送
        }
        console.log(product_a, 'cccc')
        _this.setData({
          orderDetail: {
            ...orderDetail,
            product_a,
            product_b
          }
        })
        console.log(_this.data.orderDetail)
      })
      let systemInfo = wx.getSystemInfoSync()
      let statusBarHeight = systemInfo['statusBarHeight']
      if (systemInfo.platform === 'andorid') {
        statusBarHeight = statusBarHeight + 1
      } else if (systemInfo.platform === 'ios') {
        statusBarHeight = statusBarHeight - 2
      } else {
        statusBarHeight = statusBarHeight
      }
      this.setData({
        statusBarHeight
      })
    }
  },
})