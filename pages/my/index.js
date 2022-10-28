Component({
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
          console.log(this.getTabBar())
        this.getTabBar().setData({
          selected: 2
        })
      }
    }
  }
})
