const $api = require('../../../utils/request.js').API;
const app = getApp();
Component({
  properties: {

  },
  data: {
    bannerList: [],
    menucatList: [],
    baseURL: app.gData.baseURL
  },
  methods: {
    handleGoStore(e) {
      let url = '/pages/store/index'
      console.log(e)
      let info = e.currentTarget.dataset.item
      wx.navigateTo({
        url,
        success: (res) => {
          res.eventChannel.emit('storeInfo', {
            data: info
          })
        }
      })
    },
    getStoreList() {
      $api.getStoreListAPI({pageNum: 1, pageSize: 999}).then(res => {
        let storeLimitMap = {}
        res.rows.map(v => {
          if(v.limitType === 2) {
            storeLimitMap[v.kindId] = v.kindLimit
          }
        })
        app.gData.storeLimitMap = Object.keys(storeLimitMap).length === 0 ? null : storeLimitMap
        console.log(app.gData)
        this.setData({
          menucatList: res.rows
        })
      }).catch(err => {
        console.log(err)
      })
    },
    getHomeBanner() {
      $api.getHomeBannerAPI().then(res => {
        this.setData({
          bannerList: res.rows
        })
      }).catch(err => {
        console.log(err)
      })
    }
  },
  pageLifetimes: {
    show() {}
  },
  lifetimes: {
    attached: function() {
      this.getHomeBanner()
      this.getStoreList()
    },
  }
})