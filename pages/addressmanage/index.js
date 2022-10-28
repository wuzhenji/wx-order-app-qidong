const $api = require('../../utils/request').API;
const app = getApp();
Component({
  properties: {

  },
  data: {
    statusBarHeight: 0,
    addressList: [],
    slideButtons: [{
      text: '编辑',
    }, {
      type: 'warn',
      text: '刪除'
    }],
  },
  methods: {
    // 左划点击操作按钮
    slideButtonTap(e) {
      let _this = this
      let index = e.detail.index
      let item = e.currentTarget.dataset.item
      if (index == 1) { // 删除
        wx.showModal({
          title: '提示',
          content: '是否删除？',
          cancelText: '取消',
          confirmText: '确定',
          success(res) {
            if (res.confirm) {
              _this.delAddressList(item.addressId)
            }
          }
        })
      } else if (index == 0) { // 编辑
        let url = '/pages/editaddress/index'
        wx.navigateTo({
          url,
          success: function (res) {
            res.eventChannel.emit('getAddressInfo', {
              info: item
            })
          }
        })
      }
    },
    // 删除地址
    delAddressList(id) {
      $api.delAddressListAPI({
          id
        })
        .then(res => {
          this.getAddressList()
        })
        .catch(err => {
          console.log(err)
        })
    },
    handleBack() {
      wx.navigateBack()
    },
    // 新增地址
    handleGoAddAddress() {
      let url = '/pages/editaddress/index'
      wx.navigateTo({
        url
      })
    },
    // 获得地址列表
    getAddressList() {
      $api.getAddressListAPI({
          userId: app.gData.userInfo.userId
        }).then(res => {
          this.setData({
            addressList: res.rows.map(v => {
              return {
                ...v,
                firstNameCode: v.receiveName ? v.receiveName.substr(0, 1) : ''
              }
            })
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    initData() {
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