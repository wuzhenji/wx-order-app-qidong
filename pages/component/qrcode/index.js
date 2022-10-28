const app = getApp()
Component({
  properties: {
    qrcodeUrl: {
      type: String,
      default() {
        return ''
      }
    }
  },
  data: {
    baseURL: app.gData.baseURL,
    ScreenBrightness: 0
  },
  methods: {
    closeDetail() {
      this.triggerEvent('close')
    }
  },
  lifetimes: {
    attached: function() {
      var that = this
      wx.getScreenBrightness({
        success: function (res) {
          that.setData({
            ScreenBrightness: res.value
          })
        }
      })
      //设置屏幕亮度
      wx.setScreenBrightness({
        value: 1,    //屏幕亮度值，范围 0~1，0 最暗，1 最亮
      })
    },
    detached: function() {
      wx.setScreenBrightness({
        value: this.data.ScreenBrightness,
      })
    },
  }
})
