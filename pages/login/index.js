const app = getApp();
const $api = require('../../utils/request.js').API;
Component({
  properties: {

  },
  data: {
    date: new Date().toLocaleString(),
    openid: '',
    sessionKey: '',
    showLoading: true,
    showPass: false,
    showLoginBtn: false
  },
  methods: {
    handleShowPass(e) {
      if(e.currentTarget.dataset.info){
        this.setData({
          showLoginBtn: false
        })
      } else {
        this.setData({
          showLoginBtn: true
        })
      }
      this.setData({
        showPass: true
      })
    },
    handleClosePass() {
      this.setData({
        showPass: false
      })
    },
    getPhoneNumber(res) {
      if (!this.data.openid || !this.data.sessionKey) {
        wx.showModal({
          title: '提示',
          content: '发生了未知错误，请重新打开小程序',
          cancelText: '取消',
          confirmText: '确定'
        })
        return
      }
      if (res.detail.errMsg == "getPhoneNumber:fail user deny") {
        //如果用户点击了拒绝授权，则显示警告模态框
        wx.showModal({
          title: '提示',
          content: '你已拒绝授权，请重新点击授权！',
          cancelText: '取消',
          confirmText: '确定',
          success(res) {}
        })
      } else { // 同意授权
        $api.getWxPhoneAPI({
            encryptedData: res.detail.encryptedData,
            iv: res.detail.iv,
            sessionKey: this.data.sessionKey
          }).then(res => {
            if (res.data) {
              this.login(res.data)
            }
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    login(phone) {
      $api.loginAPI({
          openid: this.data.openid,
          phone
        }).then(res => {
          wx.setStorageSync('token', res.data.token)
          app.gData.token = res.data.token
          this.getUserInfo()
        })
        .catch(err => {
          wx.showModal({
            title: '提示',
            content: err.msg,
            cancelText: '取消',
            confirmText: '确定',
            success(res) {}
          })
        })
    },
    getUserInfo() {
      $api.getUserInfoAPI().then(res => {
          wx.setStorageSync('userInfo', res.user)
          app.gData.userInfo = res.user
          let url = '/pages/user/index'
          wx.reLaunch({
            url
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    getWxSessionKey(code) {
      $api.getWxSessionKeyAPI({
          code
        }).then(res => {
          wx.setStorageSync('openid', res.data.openid)
          app.gData.openid = res.data.openid
          this.setData({
            openid: res.data.openid,
            sessionKey: res.data.sessionKey
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
  },
  pageLifetimes: {
    show() {
      if (wx.getStorageSync('token')) {
        wx.reLaunch({
          url: '/pages/user/index',
        })
      } else {
        this.setData({
          showLoading: false
        })
        let _this = this
        wx.login({
          success: function (res) {
            if (res.code) {
              _this.getWxSessionKey(res.code)
            }
          }
        });
      }
    }
  }
})