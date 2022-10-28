const $api = require('../../utils/request').API;
const app = getApp();
Component({
  properties: {

  },
  data: {
    statusBarHeight: 0,
    sexList: [{
        value: '1',
        name: '先生',
        checked: true
      },
      {
        value: '2',
        name: '女士'
      }
    ],
    form: {
      receiveSex: 1,
      addressName: '',
      receiveName: '',
      receivePhone: null
    }
  },
  methods: {
    inputAddress(e) {
      this.setData({
        form: {
          ...this.data.form,
          addressName: e.detail.value
        }
      })
    },
    inputName(e) {
      this.setData({
        form: {
          ...this.data.form,
          receiveName: e.detail.value
        }
      })
    },
    inputPhone(e) {
      this.setData({
        form: {
          ...this.data.form,
          receivePhone: e.detail.value
        }
      })
    },
    handleSave() {
      console.log(this.data.form)
      if (this.data.form.addressName.trim() == '') {
        this.showErrMessageBox('收获地址不能为空！')
        return
      }
      if (this.data.form.receiveName.trim() == '') {
        this.showErrMessageBox('联系人不能为空！')
        return
      }
      let reg = /^1\d{10}$/
      console.log(reg.test(this.data.form.receivePhone))
      if (!reg.test(this.data.form.receivePhone)) {
        this.showErrMessageBox('请填写正确的手机号！')
        return
      }
      if (this.data.form.addressId) { // 更新
        $api.putAddressListAPI(this.data.form).then(res => {
            wx.navigateBack()
          })
          .catch(err => {
            console.log(err)
          })
      } else { // 新增
        $api.addAddressListAPI({
            ...this.data.form,
            openid: app.gData.userInfo.openid
          }).then(res => {
            wx.navigateBack()
          })
          .catch(err => {
            console.log(err)
          })
      }
    },
    showErrMessageBox(text) {
      wx.showModal({
        title: '提示',
        content: text,
        cancelText: '取消',
        confirmText: '确定'
      })
    },
    handleBack() {
      wx.navigateBack()
    },
    radioChange(e) {
      this.setData({
        form: {
          ...this.data.form,
          receiveSex: e.detail.value
        }
      })
    }
  },
  pageLifetimes: {
    show() {
      let _this = this
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('getAddressInfo', function (data) {
        let {
          addressId,
          addressName,
          receiveName,
          receiveSex,
          receivePhone
        } = data.info
        _this.setData({
          form: {
            addressId,
            addressName,
            receiveName,
            receiveSex,
            receivePhone
          }
        })
        if (receiveSex == 2) { // 女士
          _this.setData({
            sexList: _this.data.sexList.map((v, m) => {
              return {
                ...v,
                checked: m == 1 ? true : false
              }
            })
          })
        }
      })
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