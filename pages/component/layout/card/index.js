const app = getApp();
const {
  addLimit,
  floatObj
} = require('../../../../utils/util')
Component({
  properties: {

  },
  data: {
    cardList: [],
    allNum: 0,
    aniStyle: true,
    showCard: false,
    confirmText: '',
    showConfirmBox: false,
  },
  methods: {
    closeConfirmBox() {
      this.setData({
        showConfirmBox: false
      })
    },
    // 下单
    handlePlaceOrder() {
      if(!this.data.cardList.length) {
        // this.setData({
        //   confirmText: '请先选择商品',
        //   showConfirmBox: true
        // })
        wx.showToast({
          title: '请先选择商品',
          icon: 'error',
          duration: 2000 
        })
        return
      }
      const hasSupplierFood = this.data.cardList.some(v => v.supplierFood === 1) // 是否有供货商食材
      const hasNotSupplierFood = this.data.cardList.some(v => v.supplierFood === 0) // 是否有普通食材
      if(hasSupplierFood && hasNotSupplierFood){ //  第三方与食堂须分开下单
        wx.showModal({
          title: '提示',
          content: '第三方与食堂须分开下单',
          cancelText: '取消',
          confirmText: '确定'
        })
        return 
      }
      const url = '/pages/placeorder/index'
      wx.navigateTo({
        url,
      })
    },
    // 减
    handleMinus(e) {
      let {
        item
      } = e.currentTarget.dataset
      let {
        productId
      } = item
      let cardList = app.gData._cardList || []
      let isExistIndex = cardList.findIndex(v => v.productId == productId)
      if (isExistIndex > -1) {
        if (cardList[isExistIndex].num > 1) {
          cardList[isExistIndex].num -= 1
        } else {
          cardList.splice(isExistIndex, 1)
        }
      }
      app.gData.cardList = cardList
      this.triggerEvent('flashCard')
      if (!cardList.length) { // 购物车商品为空
        this.setData({
          aniStyle: false
        })
        setTimeout(() => {
          this.setData({
            showCard: false
          })
        }, 200);
      }
    },
    // 加
    handleAdd(e) {
      let {
        item
      } = e.currentTarget.dataset
      if(addLimit(item.homeKindId)) {
        return
      }
      if(!item.show || !item.productStock) {
        return
      }
      let {
        productId
      } = item
      let cardList = app.gData._cardList || []
      let isExistIndex = cardList.findIndex(v => v.productId == productId)
      if (isExistIndex > -1 && cardList[isExistIndex].buyLimit != cardList[isExistIndex].num) {
        cardList[isExistIndex].num += 1
      }
      app.gData.cardList = cardList
      this.triggerEvent('flashCard')
    },
    // 显示购物车
    handleShowCard() {
      if (!app.gData._cardList || !app.gData._cardList.length) { // 购物车商品为空
        return
      }
      this.setData({
        showCard: true,
        aniStyle: true,
        cardList: app.gData._cardList.map(v => ({
          price: floatObj().multiply(v.num, v.productPrice),
          ...v
        }))
      })
    },
    // 点击隐藏购物车console.log(e)
    handleClickCard() {
      this.setData({
        aniStyle: false
      })
      // setTimeout(() => {
        this.setData({
          showCard: false
        })
      // }, 200);
    },
    // 冒泡取消隐藏
    cancelHidden() {}
  },
  pageLifetimes: {
    show() {
      let _this = this
      if(app.gData._cardList) {
        _this.setData({
          cardList: app.gData._cardList.map(v => ({
            price: floatObj().multiply(v.num, v.productPrice),
            ...v
          }))
        })
      }
      app.watch((e) => {
        _this.setData({
          cardList: e.map(v => ({
            price: floatObj().multiply(v.num, v.productPrice),
            ...v
          }))
        })
      })
    }
  },
})