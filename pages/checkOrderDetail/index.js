const app = getApp()
const $api = require('../../utils/request').API;
const {floatObj} = require('../../utils/util')
Page({
  data: {
    statusBarHeight: 0,
    orderId: '',
    orderDetail: {}
  },
  // 扫描二维码
  handleScanCode() {
    var that = this;
    wx.scanCode({ //扫描API
      onlyFromCamera: true,
      scanType: ['barCode', 'qrCode'],
      success(res) { //扫描成功
        console.log(res)
        if (res.result) {
          that.setData({
            orderId: res.result
          })
          that.initData()
        } else {
          wx.showToast({
            title: '扫描失败',
            duration: 2000
          })
        }
      }
    })
  },
  radioChange(e) {
    let detailId = e.currentTarget.dataset.detailid
    this.data.orderDetail.product_a.map(v => {
      if(v.detailId == detailId) {
        v.checkStatus2 = !v.checkStatus2
      }
    })
    this.data.orderDetail.product_b.map(v => {
      if(v.detailId == detailId) {
        v.checkStatus2 = !v.checkStatus2
      }
    })
  },
  handleCheckProduct() {
    let isAllCheckOff = this.data.orderDetail.orderDetailList.every(v => {
      return v.checkOff === 1
    })
    if(isAllCheckOff) {
      wx.showToast({
        title: '已全部核销',
        icon: 'error',
        duration: 2000
      })
      return
    }
    let detailIds = []
    this.data.orderDetail.product_a.map(v => {
      if(!v.checkStatus && v.checkStatus2){
        detailIds.push(v.detailId)
      }
    })
    this.data.orderDetail.product_b.map(v => {
      if(!v.checkStatus && v.checkStatus2){
        detailIds.push(v.detailId)
      }
    })
    if(!detailIds.length){
      wx.showToast({
        title: '请先选择商品',
        icon: 'error',
        duration: 2000
      })
      return
    }
    $api.checkOrderAPI({
      detailIds
    }).then(res => {
      this.initData()
      wx.showToast({
        title: '核销成功',
        duration: 2000
      })
    }).catch(err => {
      console.log(err)
    })
  },
  handleBack() {
    wx.navigateBack()
  },
  getCheckOrderDetail() {
    console.log(this.data.orderId, 'this.data.orderId')
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '请求中...',
    })
    $api.getCheckOrderDetailAPI({
      orderId: this.data.orderId
    }).then(res => {
      wx.hideLoading()
      let data = res.data
      let product_a = []
      let product_b = []
      data.orderDetailList.map(v => {
        v.checkStatus = v.checkOff == 1
        // v.checkStatus2 = v.checkOff == 1
        v.checkStatus2 = true
      })
      if (data.orderDetailList) {
        product_a = data.orderDetailList.filter(v => {
          return v.pickDis == 0
        }).map(v => ({singlePriceAll: floatObj().multiply(v.productPrice, v.productQuantity), ...v})) // 自取
        product_b = data.orderDetailList.filter(v => {
          return v.pickDis == 1
        }) // 配送
      }
      const isAllCheckOff = data.orderDetailList.every(v => {
        return v.checkOff === 1
      })
      app.gData.curCheckOrderInfo = {orderId: this.data.orderId, isAllCheckOff}
      this.setData({
        orderDetail: {
         ...res.data,
          product_a,
          product_b
        }
      })
    }).catch(err => {
      wx.hideLoading()
      console.log(err)
    })
  },
  initData() {
    this.getCheckOrderDetail()
  },
  onLoad: function (options) {
    app.gData.backFromCheckOrderDetail = true
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
    let _this = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('orderId', function (data) {
      _this.setData({
        orderId: data.orderId
      })
      _this.initData()
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  }
})