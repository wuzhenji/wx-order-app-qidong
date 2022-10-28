const $api = require('../../utils/request').API;
const app = getApp();
const {
  addLimit
} = require('../../utils/util')
Component({
  properties: {

  },
  data: {
    statusBarHeight: 0,
    baseURL: app.gData.baseURL,
    showDetail: false,
    productDetail: {},
    storeInfo: {},
    catList: [],
    selectedCatId: '',
    productList: [],
    curProductList: [],
    catLimitCount: null
  },
  methods: {
    handleBack() {
      wx.navigateBack()
    },
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
    // 切换左侧分类
    handleChangeCat(e) {
      let {
        catid
      } = e.currentTarget.dataset
      this.setData({
        selectedCatId: catid
      })
      this.getProductList()
    },
    // 进入搜索页面
    handleGoSearch() {
      let url = '/pages/productsearch/index'
      wx.navigateTo({
        url,
        success: (res) => {
          res.eventChannel.emit('storeInfo', {
            data: this.data.storeInfo
          })
        }
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
      let id = item.productId
      let list = this.data.curProductList
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
    // 获得左侧商品分类
    getProductCat() {
      wx.showNavigationBarLoading();
      wx.showLoading({
        title: '请求中...',
      })
      $api.getProductCatAPI({
          homeKindId: this.data.storeInfo.kindId
        }).then(res => {
          this.setData({
            catList: res.rows
          })
          wx.hideLoading()
        })
        .catch(err => {
          console.log(err)
          wx.hideLoading()
        })
    },
    // 获得右侧商品列表
    getProductList() {
      wx.showNavigationBarLoading();
      wx.showLoading({
        title: '请求中...',
      })
      let info = {
        homeKindId: this.data.storeInfo.kindId
      }
      this.data.selectedCatId && (info.categoryId = this.data.selectedCatId)
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
          wx.hideLoading()
        })
        .catch(err => {
          console.log(err)
          wx.hideLoading()
        })
    },
    initData() {
      this.getProductCat()
      this.getProductList()
    }
  },
  pageLifetimes: {
    show() {
      const eventChannel = this.getOpenerEventChannel()
      let _this = this
      const {storeLimitMap} = app.gData
      if(this.data.storeInfo.kindType) {
        _this.initData()
        return
      } 
      eventChannel.on('storeInfo', function (data) {
        const {kindId} = data.data
        let catLimitCount = null
        if(storeLimitMap && storeLimitMap.hasOwnProperty(kindId)){
          catLimitCount = storeLimitMap[kindId]
        }
        _this.setData({
          storeInfo: data.data,
          catLimitCount
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
      this.setData({
        statusBarHeight
      })
    }
  },
})