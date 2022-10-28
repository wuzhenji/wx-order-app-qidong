const app = getApp();
Component({
  properties: {
    roleid: {
      type: Number,
      value: 1
    },
    selected: {
      type: Number,
      value: 1
    }
  },
  data: {
    barlist_user: [{
        index: 1,
        name: '点餐',
        icon: '/images/menuicon.png',
        icon_active: '/images/menuicon-actived.png'
      },
      {
        index: 2,
        name: '订单',
        icon: '/images/ordericon.png',
        icon_active: '/images/ordericon-actived.png'
      },
      {
        index: 3,
        name: '我的',
        icon: '/images/myicon.png',
        icon_active: '/images/myicon-actived.png'
      },
    ],
    barlist_manager: [{
        index: 1,
        name: '点餐',
        icon: '/images/menuicon.png',
        icon_active: '/images/menuicon-actived.png'
      },
      {
        index: 2,
        name: '订单',
        icon: '/images/ordericon.png',
        icon_active: '/images/ordericon-actived.png'
      },
      {
        index: 4,
        name: '核销',
        icon: '/images/checkicon.png',
        icon_active: '/images/checkicon-actived.png'
      },
      {
        index: 3,
        name: '我的',
        icon: '/images/myicon.png',
        icon_active: '/images/myicon-actived.png'
      },
    ],
  },
  methods: {
    handleChangeBar(e) {
      const data = e.currentTarget.dataset
      this.triggerEvent('changeBar', data.index)
    }
  },
  lifetimes: {
    attached() {}
  }
})