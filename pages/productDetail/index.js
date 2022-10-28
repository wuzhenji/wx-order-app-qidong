const $api = require('../../utils/request').API;
const app = getApp();
const {
  addLimit
} = require('../../utils/util')
Page({
  data: {
    statusBarHeight: 0,
    productDetail: {},
    productBuyNum: 0,
  },
  handleBack() {
    wx.navigateBack()
  },
  // 刷新购物车列表
  flashCard() {
    this.setCurProductNum()
  },
  setCurProductNum() {
    let cardList = app.gData._cardList || []
    const {productId}  = this.data.productDetail
    const curProduct = cardList.find(v => v.productId == productId)
    this.setData({
      productBuyNum: curProduct?.num ?? 0
    })
  },
  // 点击加
  handleAdd() {
    let item = this.data.productDetail
    if(addLimit(item.homeKindId)) {
      return
    }
    if(!item.show || !item.productStock) {
      wx.showToast({
        title: '当前不可购买',
        icon: "error"
      })
      return
    }
    if(item.buyLimit && this.data.productBuyNum >= item.buyLimit){
      wx.showToast({
        title: '购买数量已达上限',
        icon: "error"
      })
      return 
    }
    let id = item.productId
    let productInfo = {
      productId: id,
      num: 1,
      receiveDate: item.receiveDate,
      productName: item.productName,
      productPrice: item.productPrice,
      categoryId: item.categoryId,
      homeKindId: item.homeKindId,
      buyLimit: item.buyLimit,
      show: item.show,
      productStock: item.productStock,
      productIcon: item.productIcon,
      pickDis: item.pickDis,
      supplierFood: item.supplierFood
    }
    // 更新到全局的购物车
    let cardList = app.gData._cardList || []
    let isExistIndex = cardList.findIndex(v => v.productId == id)
    if (isExistIndex > -1) { // 添加的商品已存在
      cardList[isExistIndex].num += 1
    } else { // 添加的商品购物车里不存在
      cardList.push(productInfo)
    }
    app.gData.cardList = cardList
    // 更新当前的购买数量
    this.setCurProductNum()
    wx.showToast({
      title: '添加成功',
      icon: "success"
    })
  },
  onLoad: function (options) {
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
      let that = this;
      const week = ['日', '一', '二', '三', '四', '五', '六']
      const eventChannel = that.getOpenerEventChannel()
      eventChannel.on('productDetail', function(productDetail) {
        that.setData({
          productDetail: {
            ...productDetail, 
            // receiveWeek: productDetail.receiveDate ? `星期${week[new Date(productDetail.receiveDate).getDay()]}` : ''
          }
        })
      })
  },
  onReady: function () {

  },
  onShow: function () {
    this.setCurProductNum()
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