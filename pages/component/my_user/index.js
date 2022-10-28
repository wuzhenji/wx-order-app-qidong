const app = getApp()
Component({
  properties: {},
  data: {
    statusBarHeight: 0,
    userInfo: {}
  },
  methods: {
    // 退出登录
    handleLoginOut() {
      wx.showModal({
        title: '提示',
        content: '是否退出登录？',
        cancelText: '取消',
        confirmText: '确定',
        success(res) {
          if (res.confirm) {
            wx.clearStorage({
              success: (res) => {
                let url = '/pages/login/index'
                wx.redirectTo({
                  url
                })
              },
            })
          }
        }
      })
    },
    // 进入地址管理
    handleGoAddressManage() {
      let url = '/pages/addressmanage/index'
      wx.navigateTo({
        url,
      })
    },
    // 进入统计页面
    handleGoStatistic() {
      let url = "/pages/statistic/index"
      wx.navigateTo({
        url,
      })
    }
  },
  lifetimes: {
    attached: function () {
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
      const reg = /(\d{3})\d{4}(\d{4})/;
      this.setData({
        userInfo: {
          ...app.gData.userInfo,
          phonenumber_hide: (app.gData.userInfo.phonenumber + '').replace(reg, '$1****$2')
        }
      })
    },
    detached: function () {},
  },
})