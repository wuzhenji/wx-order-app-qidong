const $api = require("../../utils/request").API
import tool from "../../utils/tool";
Page({
  data: {
    statusBarHeight: 0,
    date: '',
    statisticData: [],
    supplierFood: '-1',
    supplierFoodName: '全部',
    foodList: [
      {
        value: -1,
        name: '全部'
      },
      {
        value: 0,
        name: '食堂'
      },
      {
        value: 1,
        name: '第三方'
      }
    ],
  },
  handleBack() {
    wx.navigateBack()
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getStatistic()
  },
  bindFoodTypeChange: function (e) {
    let index = e.detail.value
    this.setData({
      supplierFood: this.data.foodList[index].value,
      supplierFoodName: this.data.foodList[index].name
    })
    this.getStatistic()
  },
  getStatistic() {
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '请求中...',
    })
    $api.getStatisticAPI({
      date: this.data.date,
      supplierFood: this.data.supplierFood
    }).then(res => {
      wx.hideLoading()
      this.setData({
        statisticData: res.data
      })
    }).catch(err => {
      console.log(err)
      wx.hideLoading()
    })
  },
  onLoad: function (options) {
    this.setData({
      date: tool.dateFormat('YYYY-mm-dd', new Date())
    })
    this.getStatistic()
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