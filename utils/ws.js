//创建连接
function startConnect() {
  //本地测试使用 ws协议 ,正式上线使用 wss 协议
  let baseURL = 'http://changqing.nat300.top'
  var url = 'ws://localhost:61870/socketone/one?user=lisi';
  wxst = wx.connectSocket({
    url: url,
    method: "GET"
  });
  wxst.onOpen(res => {
    console.info('连接打开成功');
  });
  wxst.onError(res => {
    console.info('连接识别');
    console.error(res);
  });
  wxst.onMessage(res => {
    var data = res.data;
    console.info(data);
  });
  wxst.onClose(() => {
    console.info('连接关闭');
  });
}

//发送内容
function sendOne(data) {
  if (wxst.readyState == wxst.OPEN) {
    wxst.send({
      data,
      success: () => {
        console.info('客户端发送成功');
      }
    });
  } else {
    console.error('连接已经关闭');
  }
}

//关闭连接
function closeOne() {
  wxst.close();
}

export default {
  startConnect,
  sendOne,
  closeOne
};