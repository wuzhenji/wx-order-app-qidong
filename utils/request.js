const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const FORM = 'FORM';
const DELETE = 'DELETE';

// const baseURL = 'http://192.168.0.113:8899/';
const baseURL = 'https://a.indexsoft.com.cn:8989/prod-api/'
// const baseURL = 'http://rd9swa.natappfree.cc/'

function request(method, url, data) {
    const token = wx.getStorageSync('token') || ''
    const Authorization = token ? `Bearer ${token}` : ''
    return new Promise(function (resolve, reject) {
        let header = {
            'content-type': 'application/json',
            
            Authorization: Authorization
        };
        wx.request({
            url: baseURL + url,
            method: method,
            data: method === POST ? JSON.stringify(data) : data,
            header: header,
            success(res) {
                if (res.data.code == 200) {
                    resolve(res.data);
                } else if (res.data.code == 401) {
                    wx.removeStorageSync('token')
                    wx.removeStorageSync('userInfo')
                    wx.reLaunch({
                        url: '/pages/login/index',
                    })
                } else if (res.data.code == -101) {
                    if (res.data.msg.indexOf("已截单，无法取消订单") > -1) {
                        wx.showModal({
                            title: '错误信息',
                            showCancel: false,
                            content: res.data.msg
                        })
                    } else {
                        wx.showToast({
                            title: res.data.msg,
                            icon: 'error',
                            duration: 2000,
                        })
                    }
                } else {
                    reject(res.data);
                }
            },
            fail(err) {
                //请求失败
                console.log('接口错误=>>>>', err)
                reject(err)
            }
        })
    })
}

const API = {
    loginAPI: (data) => request(POST, `wechat/login?openid=${data.openid}&phone=${data.phone}`), // 登录
    getUserInfoAPI: (data) => request(GET, `getInfo`), // 查询用户信息
    getWxSessionKeyAPI: (data) => request(GET, `wechat/sessionKey`, data), // 查询sessionKey
    getWxPhoneAPI: (data) => request(POST, `wechat/decodePhone`, data), // 查询用户手机号
    getStoreListAPI: (data) => request(GET, `home/kind/list`, data), // 查询大类
    getProductCatAPI: (data) => request(GET, `product/category/list`, data), // 查询小类
    getProductListAPI: (data) => request(GET, `applets/product/list`, data), // 查询商品列表
    getAddressListAPI: (data) => request(GET, `applets/address/list`, data), // 查询地址列表
    putAddressListAPI: (data) => request(POST, `applets/address/edit`, data), // 更新地址列表 ==>>>改nmb
    addAddressListAPI: (data) => request(POST, `applets/address`, data), // 新增地址列表
    delAddressListAPI: (data) => request(POST, `applets/address/rm/${data.id}`), // 删除地址列表 ==>>>改nmb
    getOrderListAPI: (data) => request(GET, `order/master/list`, data), // 查询订单列表
    getOrderDetailAPI: (data) => request(GET, `order/master/detail`, data), // 查询订单列表
    placeOrderAPI: (data) => request(POST, `order/master`, data), // 下单
    getCanteenListAPI: (data) => request(GET, `canteen/info/list`, data), // 查询食堂
    afterPayAPI: (data) => request(POST, `order/master/afterPay/${data.id}`), // 支付完成，改变订单状态
    afterNoPayAPI: (data) => request(POST, `order/master/afterNoPay/${data.id}`), // 第三方食材，无需支付，改变订单状态
    goPayAPI: (data) => request(POST, `order/master/wechatPay`, data), // 去付款（订单页面没付款）
    calcelOrderAPI: (data) => request(POST, `order/master/cancel`, data), // 取消订单
    getCheckOrderListAPI: (data) => request(GET, `order/master/writeOff/list`, data), // 核销列表
    getCheckOrderDetailAPI: (data) => request(GET, `order/master/${data.orderId}`, data), // 核销详情
    checkOrderAPI: (data) => request(POST, `order/master/writeOff/check`, data), // 核销
    getOrderIdByPickupcodeAPI: (data) => request(GET, `order/master/code2OrderId`, data), // 根据取货码查询订单id
    getStatisticAPI: (data) => request(GET, `statistic/${data.date}`, data), // 统计
    getHomeBannerAPI: (data) => request(GET, `home/car/list`, data), // 首页轮播图
};
module.exports = {
    API: API
}