const app = getApp();
const $api = require("../../utils/request").API
import tool from "../../utils/tool";
const {floatObj} = require('../../utils/util')
Component({
  properties: {

  },
  data: {
    orderId: '',
    statusBarHeight: 0,
    canteenList: [], // 配货地址列表(食堂)
    addressList: [], // 收货地址列表
    addressId_a: '', // 取货地址(自取商品)
    addressId_b: '', // 收货地址(配送商品)
    addressId_c: '', // 配货地址(配送商品)
    pickIndex_a: '',
    pickIndex_b: '',
    pickIndex_c: '',
    cardList: [],
    cardList1: [], // 自取商品
    cardList2: [], // 配送商品
    allPrice: 0,
    isSupplierFood: false
  },
  methods: {
    // 清空购物车
    clearCard() {
      app.gData.cardList = []
    },
    // 支付
    goPay(info) {
      let _this = this
      wx.requestPayment({
        timeStamp: info.timeStamp,
        nonceStr: info.nonceStr,
        package: info.pk,
        signType: 'MD5',
        paySign: info.paySign,
        success(res) {
          wx.hideLoading()
          _this.afterPay()
        },
        fail(res) {
          console.log(res)
          wx.hideLoading()
          _this.clearCard()
          if (res.errMsg == 'requestPayment:fail cancel') {
            wx.redirectTo({
              url: '/pages/user/index?selected=2',
            })
          }
        }
      })
    },
    // 显示错误信息
    showErrBox(text) {
      wx.showModal({
        title: '提示',
        content: text,
        cancelText: '取消',
        confirmText: '确定',
      })
    },
    // 去支付
    handleGoPay: tool.throttle(function () {
      // if (this.data.cardList1.length) {
      //   if (this.data.pickIndex_a == '') {
      //     this.showErrBox('取货地址不能为空')
      //     return
      //   }
      // }
      // if (this.data.cardList2.length) {
      //   if (this.data.pickIndex_b == '') {
      //     this.showErrBox('收货地址不能为空')
      //     return
      //   }
      //   if (this.data.pickIndex_c == '') {
      //     this.showErrBox('配货地址不能为空')
      //     return
      //   }
      // }
      wx.showNavigationBarLoading();
      wx.showLoading({
        title: '请求中...',
      })
      const isSupplierFood = this.data.cardList.some(v => v.supplierFood === 1)
      this.setData({
        isSupplierFood
      })
      let orderDetailList = this.data.cardList.map(v => {
        return {
          productId: v.productId,
          productQuantity: v.num,
          receiveTime: v.receiveDate
        }
      })
      let addressId = this.data.pickIndex_b != '' ? this.data.addressList[this.data.pickIndex_b].value : ''
      let buyerCanteenName = this.data.pickIndex_c != '' ? this.data.canteenList[this.data.pickIndex_c].name : ''
      // let canteenName = this.data.pickIndex_a != '' ? this.data.canteenList[this.data.pickIndex_a].name : ''
      let canteenName = this.data.canteenList[0].name
      let form = {
        addressId,
        buyerCanteenName,
        canteenName,
        orderDetailList,
        openid: wx.getStorageSync('openid')
      }
      this.placeOrder(form)
    }),
    afterNoPay() {
      $api.afterNoPayAPI({
        id: this.data.orderId
      }).then(res => {
        this.clearCard()
        wx.hideLoading()
        wx.redirectTo({
          url: '/pages/user/index?selected=2',
        })
      }).catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },
    // 改变订单状态
    afterPay() {
      $api.afterPayAPI({
        id: this.data.orderId
      }).then(res => {
        this.clearCard()
        wx.hideLoading()
        wx.redirectTo({
          url: '/pages/user/index?selected=2',
        })
      }).catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },
    //提交订单
    placeOrder(form) {
      $api.placeOrderAPI(form).then(res => {
        this.setData({
          orderId: res.data.orderId
        })
        if(this.data.isSupplierFood){
          this.afterNoPay()
        } else {
          this.goPay(res.data)
        }
      }).catch(err => {
        console.log(err)
        wx.hideLoading()
      })
    },
    // 获得取货地址
    getCanteenList() {
      $api.getCanteenListAPI().then(res => {
        this.setData({
          canteenList: res.rows.map(v => {
            return {
              name: v.canteenName,
              value: v.canteenId
            }
          })
        })
      }).catch(err => {
        console.log(err)
      })
    },
    // 获得收获地址
    getAddressList() {
      $api.getAddressListAPI({
          userId: app.gData.userInfo.userId
        }).then(res => {
          this.setData({
            addressList: res.rows.map(v => {
              return {
                name: v.addressName,
                value: v.addressId
              }
            })
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    handleBack() {
      wx.navigateBack()
    },
    bindPickerChange_a(e) {
      this.setData({
        pickIndex_a: e.detail.value
      })
    },
    bindPickerChange_b(e) {
      this.setData({
        pickIndex_b: e.detail.value
      })
    },
    bindPickerChange_c(e) {
      this.setData({
        pickIndex_c: e.detail.value
      })
    },
    initData() {
      let cardList = app.gData._cardList || []
      let cardList1 = cardList.filter(v => {
        return v.pickDis == 0
      }) // 自取
      let cardList2 = cardList.filter(v => {
        return v.pickDis == 1
      }) // 需要配送
      let allPrice = 0
      cardList.map(v => {
        allPrice += floatObj().multiply(v.num, v.productPrice)
      })
      this.setData({
        cardList,
        cardList1,
        cardList2,
        allPrice
      })
      this.getCanteenList()
      this.getAddressList()
    }
  },
  pageLifetimes: {
    show() {
      this.initData()
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
  }
})