const app = getApp()
const $api = require('../../../utils/request').API;
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
    checkOrderList: [],
    canteenList: [{
      name: '全部',
      value: ''
    }], // 配货地址列表(食堂)
    page: {
      pageNum: 1,
      pageSize: 10
    },
    total: 0,
    createTime: '',
    endTime: '',
    ps: 0,
    pickupCode: '',
    type: '1', // 为1查全部 为2查已核销  为3查待核销
    canteenName: '全部',
    supplierFood: '-1',
    supplierFoodName: '全部',
    typeList: [{
        value: '1',
        name: '全部',
      },
      {
        value: '2',
        name: '已核销',
      },
      {
        value: '3',
        name: '待核销',
      },
    ],
    statusList: [{
        value: [1, 2],
        name: '待核销',
      },
      {
        value: [3],
        name: '已核销',
      }
    ],
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
    typeName: '全部',
    showSendProduct: false,
    showReFlash: false,
    timer: null
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
        this.getCheckOrderList()
      }
    }
  },
  methods: {
    // 实时刷新
    handleShowReFlash(e) {
      if(e.detail.value) {
        this.data.timer = setInterval(() => {
          this.fetchData()
        }, 10000)
      } else {
        clearInterval(this.data.timer)
      }
    },
    // 只显示需要配送的物品
    handleShowSendProduct(e) {
      if(e.detail.value) {
        this.setData({
          ps: 1
        })
        this.fetchData()
      } else {
        this.setData({
          ps: 0
        })
        this.fetchData()
      }
    },
    // 搜索
    handleSearch() {
      console.log(this.data.pickupCode)
      $api.getOrderIdByPickupcodeAPI({
        pickupCode: this.data.pickupCode
      }).then(res => {
        this.goDetail(res.data)
      }).catch(err => {
        console.log(err)
      })
    },
    getInputValue(e) {
      this.setData({
        pickupCode: e.detail.value
      })
    },
    // 进入订单详情
    handleGoDetail(e) {
      let orderId = e.currentTarget.dataset.id
      this.goDetail(orderId)
    },
    goDetail(orderId) {
      let url = '/pages/checkOrderDetail/index'
      wx.navigateTo({
        url,
        success: (res) => {
          res.eventChannel.emit('orderId', {
            orderId
          })
        }
      })
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
            that.goDetail(res.result)
          } else {
            wx.showToast({
              title: '扫描失败',
              duration: 2000
            })
          }
        }
      })
    },
    // 清空日期
    clearDate() {
      this.setData({
        createTime: '',
        endTime: ''
      })
      this.fetchData()
    },
    bindStartDateChange: function (e) {
      this.setData({
        createTime: e.detail.value
      })
      this.fetchData()
    },
    bindEndDateChange: function (e) {
      this.setData({
        endTime: e.detail.value
      })
      this.fetchData()
    },
    bindTypeChange: function (e) {
      let index = e.detail.value
      this.setData({
        typeName: this.data.typeList[index].name,
        type: this.data.typeList[index].value
      })
      this.fetchData()
    },
    bindFoodTypeChange: function (e) {
      let index = e.detail.value
      this.setData({
        supplierFood: this.data.foodList[index].value,
        supplierFoodName: this.data.foodList[index].name
      })
      this.fetchData()
    },
    bindCanteenChange(e) {
      let index = e.detail.value
      this.setData({
        canteenName: this.data.canteenList[index].name,
      })
      this.fetchData()
    },
    // 返货状态中文
    getStatusName(type) {
      let name = ''
      this.data.statusList.map(v => {
        if (v.value.indexOf(type) > -1) {
          name = v.name
        }
      })
      return name
    },
    fetchData() {
      this.setData({
        page: {
          pageNum: 1,
          pageSize: 10
        }
      })
      this.getCheckOrderList()
    },
    // 获得核销订单列表
    getCheckOrderList() {
      // wx.showNavigationBarLoading();
      // wx.showLoading({
      //   title: '请求中...',
      // })
      $api.getCheckOrderListAPI({
        ...this.data.page,
        type: this.data.type + '',
        createTime: this.data.createTime,
        endTime: this.data.endTime,
        ps: this.data.ps,
        supplierFood: this.data.supplierFood,
        canteenName: this.data.canteenName == '全部' ? '' : this.data.canteenName
      }).then(res => {
        let data = res.rows.map(v => {
          return {
            ...v,
            statusName: this.getStatusName(v.orderStatus),
            orderDetailName: v.orderDetailList.map(vv => {
              return `${vv.productName}(x${vv.productQuantity})`
            }).join('，')
          }
        })
        if (this.data.page.pageNum == 1) {
          this.setData({
            checkOrderList: data,
            total: res.total
          })
        } else {
          this.setData({
            checkOrderList: [...this.data.checkOrderList, ...data],
            total: res.total
          })
        }
        wx.hideLoading()
      }).catch(err => {
        wx.hideLoading()
        console.log(err)
      })
    },
    // 获得取货地址
    getCanteenList() {
      $api.getCanteenListAPI().then(res => {
        this.setData({
          canteenList: [...this.data.canteenList, ...res.rows.map(v => {
            return {
              name: v.canteenName,
              value: v.canteenId
            }
          })]
        })
        this.getCheckOrderList()
      }).catch(err => {
        console.log(err)
      })
    },
  },
  pageLifetimes: {
    show() {
      const { backFromCheckOrderDetail, curCheckOrderInfo } = app.gData
      const { orderId, isAllCheckOff } = curCheckOrderInfo
      if (backFromCheckOrderDetail) {
        app.gData.backFromCheckOrderDetail = false
        this.setData({
          checkOrderList: this.data.checkOrderList.map(v => {
            if(v.orderId === orderId) {
              return {
                ...v,
                statusName: isAllCheckOff ? "已核销" : "待核销" 
              }
            } else {
              return {...v}
            }
          })
        })
      } else {
        this.fetchData()
      }
    }
  },
  lifetimes: {
    attached: function () {
      this.getCanteenList()
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
    detached: function () {
      clearInterval(this.data.timer)
    },
  },
})