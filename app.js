const $api = require('./utils/request.js').API;
App({
  onLaunch: function () {
    var _this = this;
    
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    if (wx.getStorageSync('token')) {
      _this.gData.token = wx.getStorageSync('token')
    }
    if (wx.getStorageSync('userInfo')) {
      _this.gData.userInfo = wx.getStorageSync('userInfo')
    }
    if (_this.gData.token) {
      // _this.getUserInfo()
    } else {
      // console.log(getCurrentPages())
      // let url = '/pages/login/index'
      // wx.reLaunch({
      //   url
      // })
    }
  },
  gData: {
    name: '',
    appid: 'wxea3cecbe62dc2605',
    sessionId: '',
    token: '',
    baseURL: 'https://a.indexsoft.com.cn:8989/prod-api/',
    wsURL: 'ws://server.natappfree.cc:45801',
    logined: false, //用户是否登录
    authsetting: null, //用户授权结果
    userInfo: {}, //用户信息(包含自定义登录态token)
    cardList: [],
    openid: '',
    backFromCheckOrderDetail: false,
    curCheckOrderInfo: { orderId: '', isAllCheckOff: true },
    storeLimitMap: null, // 大类限购列表
  },
  getUserInfo() {
    $api.getUserInfoAPI().then(res => {
        wx.setStorageSync('userInfo', res.user)
        this.gData.userInfo = res.user
      })
      .catch(err => {
        console.log(err)
      })
  },
  // 监听全局变量
  watch: function (method) {
    var obj = this.gData
    Object.defineProperty(obj, 'cardList', {
      configurable: true,
      enumerable: true,
      set: function (value) {
        this._cardList = value;
        method(value);
      },
      get: function () {
        return this.gData
      }
    })

  }
})