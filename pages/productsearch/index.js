const $api = require('../../utils/request').API;
const app = getApp();
Component({
  properties: {

  },
  data: {
    statusBarHeight: 0,
    storeInfo: {},
    productList: [],
    curProductList: [],
    showDetail: false,
    productDetail: {}
  },
  methods: {
    // 显示详情
    handShowDetail(e) {
      let {
        item
      } = e.currentTarget.dataset
      // this.setData({
      //   showDetail: true,
      //   productDetail: item
      // })
      wx.navigateTo({
        url: '/pages/productDetail/index',
        success: function (res) {
          res.eventChannel.emit('productDetail', item)
        }
      })
    },
    // 关闭详情
    closeDetail() {
      this.setData({
        showDetail: false
      })
    },
    // 点击减
    handleMinus(e) {
      let {
        item
      } = e.target.dataset
      let id = item.productId
      let list = this.data.curProductList
      list.map(v => {
        if (v.productId == id) {
          v.num -= 1
        }
      })
      this.setData({
        curProductList: list
      })
      // 更新到全局的购物车
      let cardList = app.gData._cardList || []
      let isExistIndex = cardList.findIndex(v => v.productId == id)
      if (isExistIndex > -1) { // 减一的商品已存在
        if (cardList[isExistIndex].num > 1) {
          cardList[isExistIndex].num -= 1
        } else {
          cardList.splice(isExistIndex, 1)
        }
      }
      app.gData.cardList = cardList
    },
    // 点击加
    handleAdd(e) {
      let {
        item
      } = e.target.dataset
      if (!item.show || !item.productStock) {
        return
      }
      let id = item.productId
      let list = this.data.curProductList
      let productInfo = {
        productId: id,
        num: 1,
        receiveDate: item.receiveDate,
        productName: item.productName,
        productPrice: item.productPrice,
        categoryId: item.categoryId,
        buyLimit: item.buyLimit,
        show: item.show,
        productStock: item.productStock,
        productIcon: item.productIcon,
        pickDis: item.pickDis
      }
      list.map(v => {
        if (v.productId == id) {
          v.num += 1
        }
      })
      this.setData({
        curProductList: list
      })
      // 更新到全局的购物车
      let cardList = app.gData._cardList || []
      let isExistIndex = cardList.findIndex(v => v.productId == id)
      if (isExistIndex > -1) { // 添加的商品已存在
        cardList[isExistIndex].num += 1
      } else { // 添加的商品购物车里不存在
        cardList.push(productInfo)
      }
      app.gData.cardList = cardList
    },
    // 返回
    handleBack() {
      wx.navigateBack()
    },
    search: function (value) {
      console.log(value)
      this.getProductList(value)
      return new Promise((resolve, reject) => {
        resolve()
      })
    },
    selectResult() {
      console.log('select result', e.detail)
    },
    // 刷新购物车列表
    flashCard() {
      let cardList = app.gData._cardList || []
      let curProductList = this.data.curProductList
      curProductList.map(v => {
        let index = cardList.findIndex(vv => vv.productId == v.productId)
        if (index > -1) {
          v.num = cardList[index].num
        } else {
          v.num = 0
        }
      })
      this.setData({
        curProductList
      })
    },
    // 获得右侧商品列表
    getProductList(productName) {
      let info = {
        productName,
        homeKindId: this.data.storeInfo.kindId
      }
      $api.getProductListAPI(info).then(res => {
          let cardList = app.gData._cardList || []
          this.setData({
            productList: res.rows,
            curProductList: res.rows.map(v => {
              let index = cardList.findIndex(vv => vv.productId == v.productId)
              return {
                ...v,
                num: index > -1 ? cardList[index].num : 0
              }
            })
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    initData() {
      this.setData({
        search: this.search.bind(this)
      })
    }
  },
  pageLifetimes: {
    show() {
      const eventChannel = this.getOpenerEventChannel()
      let _this = this
      eventChannel.on('storeInfo', function (data) {
        _this.setData({
          storeInfo: data.data
        })
        _this.initData()
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
      console.log('height', statusBarHeight)
      this.setData({
        statusBarHeight
      })
    }
  },
})