var app = getApp();
function wxpay(app, money, orderId, redirectUrl) {
  let remark = "在线充值";
  let nextAction = {};
  if (orderId != 0) {
    remark = "支付订单 ：" + orderId;
    nextAction = { type: 0, id: orderId };
  }
  wx.request({
    url: app.globalData.urls + '/checkout/wx/verifyinfo',
    data: {
      orderId: orderId,
    },
    header: app.getPostRequestHeader(),
    method:'POST',
    success: function(res){
      app.saveReponseHeader(res);
      if(res.data.code == 200){
        // 发起支付
        var jsApiParameters = res.data.data.jsApiParameters;
        wx.requestPayment({
          timeStamp: jsApiParameters.timeStamp,
          nonceStr: jsApiParameters.nonceStr,
          package: jsApiParameters.package, // 'prepay_id=' + res.data.data.prepayId,
          signType: jsApiParameters.signType, //'MD5',
          paySign: jsApiParameters.paySign,
          fail:function (aaa) {
            wx.showToast({title: '支付失败'})
          },
          success:function () {
            wx.showToast({title: '支付成功'})
            wx.redirectTo({
              url: redirectUrl
            });
          }
        })
      } else {
        wx.showToast({ title: '服务器忙' + res.data.code + res.data.msg})
      }
    }
  })
}

module.exports = {
  wxpay: wxpay
}
