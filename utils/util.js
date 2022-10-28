const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 返回true:需要限制    false:不需要限制
const addLimit = (id) => {
  const app = getApp();
  const {
    _cardList,
    storeLimitMap
  } = app.gData
  if(!storeLimitMap) {
    return false
  }
  const kindLimit = storeLimitMap[id]
  if(!kindLimit) { // 大类不限制
    return false
  }
  // 计算当前大类已经添加的商品数量
  let num = 0
  _cardList?.map(v => {
    if(v.homeKindId === id) {
      num += v.num
    }
  })
  console.log(_cardList, num, id, kindLimit)
  if(num >= kindLimit) {
    wx.showToast({
      title: '当前大类购买超出限制',
      icon: "error"
    })
    return true
  } else {
    return false
  }
}

function floatObj() {
	function isInteger(obj) {
		return Math.floor(obj) === obj
	}
	function toInteger(floatNum) {
		var ret = {times: 1, num: 0};
		if (isInteger(floatNum)) {
			ret.num = floatNum;
			return ret
		}
		var strfi = floatNum + '';
		var dotPos = strfi.indexOf('.');
		var len = strfi.substr(dotPos + 1).length;
		var times = Math.pow(10, len);
		var intNum = parseInt(floatNum * times + 0.5, 10);
		ret.times = times;
		ret.num = intNum;
		return ret
	}
	function operation(a, b, op) {
		var o1 = toInteger(a);
		var o2 = toInteger(b);
		var n1 = o1.num;
		var n2 = o2.num;
		var t1 = o1.times;
		var t2 = o2.times;
		var max = t1 > t2 ? t1 : t2;
		var result = null;
		switch (op) {
			case 'add':
				if (t1 === t2) { // 两个小数位数相同
					result = n1 + n2
				} else if (t1 > t2) { // o1 小数位 大于 o2
					result = n1 + n2 * (t1 / t2)
				} else { // o1 小数位 小于 o2
					result = n1 * (t2 / t1) + n2
				}
				return result / max;
			case 'subtract':
				if (t1 === t2) {
					result = n1 - n2
				} else if (t1 > t2) {
					result = n1 - n2 * (t1 / t2)
				} else {
					result = n1 * (t2 / t1) - n2
				}
				return result / max;
			case 'multiply':
				result = (n1 * n2) / (t1 * t2);
				return result;
			case 'divide':
				result = (n1 / n2) * (t2 / t1);
				return result
		}
	}

	// 加减乘除的四个接口
	function add(a, b) {
		return operation(a, b, 'add')
	}

	function subtract(a, b) {
		return operation(a, b, 'subtract')
	}

	function multiply(a, b) {
		return operation(a, b, 'multiply')
	}

	function divide(a, b) {
		return operation(a, b, 'divide')
	}

	// exports
	return {
		add: add,
		subtract: subtract,
		multiply: multiply,
		divide: divide
	}
};

module.exports = {
  formatTime,
  addLimit,
  floatObj
}
