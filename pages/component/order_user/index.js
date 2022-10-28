const app = getApp()
const $api = require('../../../utils/request').API;
import tool from "../../../utils/tool";
Component({
  properties: {
    isBottom: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data: {
    statusBarHeight: 0,
    page: {
      pageNum: 1,
      pageSize: 10
    },
    total: 0,
    orderList: [],
    statusList: [{
      name: '待付款',
      type: 0,
    }, {
      name: '待取货', // 待取货
      type: 1,
    }, {
      name: '待取货', // 待送货
      type: 2,
    }, {
      name: '已完结',
      type: 3,
    }, {
      name: '已取消',
      type: 4,
    }, ],
    imgUrls: [
      '../../../images/menuhome-swiper1.jpg',
      '../../../images/menuhome-swiper2.jpg',
      '../../../images/menuhome-swiper3.jpg',
      '../../../images/menuhome-swiper4.jpg',
      '../../../images/menuhome-swiper5.jpg',
      '../../../images/menuhome-swiper1.jpg',
      '../../../images/menuhome-swiper2.jpg',
      '../../../images/menuhome-swiper3.jpg',
    ],
    indicatorDots: false, //导航点
    autoplay: false,
    circular: false, //衔接滑动
    duration: 100,
    showQrcode: false,
    qrcodeUrl: ''
  },
  observers: {
    'isBottom': function (val) {
      if (val == null) return;
      if (val && this.data.page.pageNum * 10 < this.data.total) {
        this.setData({
          page: {
            pageNum: this.data.page.pageNum + 1,
            pageSize: 10
          }
        })
        wx.showNavigationBarLoading();
        wx.showLoading({
          title: '请求中...',
        })
        this.getOrderList()
      }
    }
  },
  methods: {
    closeShowQrcode() {
      this.setData({
        qrcodeUrl: '',
        showQrcode: false
      })
    },
    handleShowQrcode(e) {
      let {
        pickupCodeImg
      } = e.target.dataset.item
      this.setData({
        qrcodeUrl: pickupCodeImg,
        showQrcode: true
      })
    },
    handleCancelOrder(e) {
      let {
        orderId
      } = e.target.dataset.item
      let _this = this
      wx.showModal({
        title: '提示',
        content: '是否取消订单？',
        cancelText: '取消',
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            _this.calcelOrder(orderId)
          }
        }
      })
    },
    // 取消订单
    calcelOrder(orderId) {
      $api.calcelOrderAPI({
        orderId
      }).then(res => {
        let newOrderList = this.data.orderList
        newOrderList.map(v => {
          if (v.orderId == orderId) {
            v.orderStatus = 4
          }
        })
        this.setData({
          orderList: newOrderList
        })
      }).catch(err => {
        console.log(err)
      })
    },
    // 去支付
    handleGoPay: tool.debounce(function (e) {
      let _this = this
      let {
        orderId
      } = e[0].target.dataset.item
      wx.showNavigationBarLoading();
      wx.showLoading({
        title: '请求中...',
      })
      $api.goPayAPI({
        orderId
      }).then(res => {
        let info = res.data
        wx.requestPayment({
          timeStamp: info.timeStamp,
          nonceStr: info.nonceStr,
          package: info.pk,
          signType: 'MD5',
          paySign: info.paySign,
          success(res) {
            wx.hideLoading()
            _this.afterPay(orderId)
          },
          fail(res) {
            console.log(res)
            wx.hideLoading()
            if (res.errMsg == 'requestPayment:fail cancel') {
              _this.reflashList()
            }
          }
        })
      }).catch(err => {
        console.log(err)
        wx.hideLoading()
      })
    }),
    // 订单状态
    getStatus(code) {
      let status = ''
      this.data.statusList.map(v => {
        if (v.type == code) {
          status = v.name
        }
      })
      return status
    },
    // 改变订单状态
    afterPay(orderId) {
      $api.afterPayAPI({
        id: orderId
      }).then(res => {
        this.reflashList()
        this.setData({
          orderList: newOrderList
        })
        wx.hideLoading()
      }).catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },
    // 刷新列表
    reflashList() {
      this.setData({
        page: {
          pageNum: 1,
          pageSize: 10
        }
      })
      this.getOrderList()
    },
    // 进入订单详情
    handleGoOrderDetail(e) {
      let url = '/pages/orderdetail/index'
      wx.navigateTo({
        url,
        success: (res) => {
          res.eventChannel.emit('getOrderDetail', e.currentTarget.dataset.item)
        }
      })
    },
    getOrderList() {
      $api.getOrderListAPI({
        userId: app.gData.userInfo.userId,
        ...this.data.page
      }).then(res => {
        let data = res.rows.map(v => {
          return {
            ...v,
            statusName: this.getStatus(v.orderStatus)
          }
        })
        if (this.data.page.pageNum == 1) {
          this.setData({
            orderList: data,
            total: res.total
          })
        } else {
          this.setData({
            orderList: [...this.data.orderList, ...data],
            total: res.total
          })
        }
        wx.hideLoading()
      }).catch(err => {
        console.log(err)
        wx.hideLoading()
      })
    }
  },
  pageLifetimes: {
    show() {
      this.reflashList()
    },
  },
  lifetimes: {
    attached: function () {
      this.getOrderList()
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
    detached: function () {},
  },
})