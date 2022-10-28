const app = getApp()
Page({
  properties: {},
  data: {
    roleid: 2,
    selected: 1,
    userInfo: {},
    isBottom: false
  },
  changeBar(e) {
    this.setData({
      selected: e.detail
    })
  },
  onLoad() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if(currentPage.options.selected) {
      this.setData({
        selected: +currentPage.options.selected || 1
      })
    }
    this.setData({
      roleid: app.gData.userInfo.workAccount
    })
  },
  onReachBottom(e) {
    this.setData({
      isBottom: false
    })
    this.setData({
      isBottom: true
    })
  }
})