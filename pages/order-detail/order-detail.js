var app = getApp();
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
    data:{
      //语言 - begin
      language: '',
      //语言 - end
      orderId:0,
      goodsList:[],
      orderStatus: 0,
      yunPrice:"0.00"
    },
    // 语言 
    // 设置language变量（翻译Object）
    setLanguage() {
      var lang = wx.T.getLanguage()
      this.setData({
        language: lang,
        selectSize: lang.select_attribute
      });
      //this.initCartInfo()
    },
    languageChange() {
      var lang = wx.T.getLanguage()
      this.setData({
        language: lang,
        selectSize: lang.select_attribute
      });
      this.onShow()
    },
    onLoad:function(e){
      var that = this;
      var orderId = e.id;
      if(!e.share){ 
        that.setData({ share: true }); 
      }
      if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
      // 语言
      // 设置当前页面的language变量 - 每个页面都要有
      this.setLanguage();
      event.on("languageChanged", this, this.languageChange); // (2)
      // 设置当前页面的language Index - 每个页面都要有
      wx.T.setLocaleByIndex(wx.T.langIndex);
      // 语言 - 结束

      that.data.orderId = orderId;
      that.setData({
        orderId: orderId
      });
    },
    onShow : function () {
      var that = this;
      wx.showLoading();
      setTimeout(function () {
        wx.request({
          url: app.globalData.urls + '/customer/order/wxview',
          header: app.getRequestHeader(),
          data: {
            token: app.globalData.token,
            increment_id: that.data.orderId
          },
          success: (res) => {
            wx.hideLoading();
            if (res.data.code != 200) {
              wx.showModal({
                title: that.data.language.error,  //'错误',
                content: that.data.language.order_get_info_fail,  //'订单信息获取错误',
                showCancel: false
              })
              return;
            }
            var order = res.data.data.order;
            var product_items = order.products
            var goods = [];
            if (order.products) {
              for (var x in product_items) {
                var product_item = product_items[x]
                goods.push({
                  goodsName: product_item.name,
                  amount: product_item.price,
                  property: product_item.custom_option_info_str,
                  number: product_item.qty,
                  pic: product_item.imgUrl,
                })
              }
            }
            var statusStr = '';
            var status = 0;
            var order_status = order.order_status;
            if (order_status == 'payment_pending' || order_status == 'payment_processing') {
              statusStr = that.data.language.order_wait_pay //'待支付'
              status = 0
            } else if (order_status == 'payment_confirmed') {
              statusStr = that.data.language.order_wait_deliver  //'已支付待发货'
              status = 1
            } else if (order_status == 'payment_canceled') {
              statusStr = that.data.language.canceled //'已取消'
              status = -1
            } else if (order_status == 'dispatched') {
              statusStr = that.data.language.pending_receipt //'已发货待确认'
              status = 2
            } else if (order_status == 'completed') {
              statusStr = that.data.language.order_complete //'已完成'
              status = 3
            } 
            
            var orderDetail = {
              statusStr: order.order_status,
              trackingNumber: order.tracking_number,
              trackingCompany: order.tracking_company,
              linkMan: order.customer_firstname + order.customer_lastname,
              mobile: order.customer_telephone,
              address: order.customer_address_street1,
              goods: goods,
              symbol: order.currency_symbol,
              product_amount: order.subtotal,
              shipping_cost: order.shipping_total,
              grand_total: order.grand_total,
              subtotal_with_discount: order.subtotal_with_discount,

            }

            that.setData({
              orderDetail: orderDetail,
              orderStatusStr: statusStr,
              orderStatus: status,
            });
            app.saveReponseHeader(res);
          }
        })
        wx.hideLoading();
        var yunPrice = parseFloat(that.data.yunPrice);
        var allprice = 0;
        var goodsList = that.data.goodsList;
        for (var i = 0; i < goodsList.length; i++) {
          allprice += parseFloat(goodsList[0].price) * goodsList[0].number;
        }
        that.setData({
          allGoodsPrice: allprice,
          yunPrice: yunPrice
        });
      }, 800)
    },
    wuliuDetailsTap:function(e){
      var orderId = e.currentTarget.dataset.id;
      var numberId = e.currentTarget.dataset.number;
      wx.navigateTo({
        url: "/pages/logistics/logistics?id=" + orderId + '&number=' + numberId
      })
    },
    confirmBtnTap:function(e){
      let that = this;
      let orderId = this.data.orderId;
      let formId = e.detail.formId;
      wx.showModal({
        title: that.data.language.confirm_receive_product,  //'确认您已收到商品？',
          content: '',
          success: function(res) {
            if (res.confirm) {
              wx.showLoading();
              wx.request({
                url: app.globalData.urls + '/customer/order/delivery',
                data: {
                  orderId: orderId
                },
                header: app.getRequestHeader(),
                success: (res) => {
                  if (res.data.code == 200) {
                    that.onShow();
                    // 模板消息，提醒用户进行评价
                    let postJsonString = {};
                    postJsonString.keyword1 = { value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177' }
                    let keywords2 = that.data.language.confirm_and_next_come;  //'您已确认收货，期待您的再次光临！';
                    //if (app.globalData.order_reputation_score) {
                    //  keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score +'积分奖励。';
                    //}
                    postJsonString.keyword2 = { value: keywords2, color: '#173177' }
                    app.sendTempleMsgImmediately(app.siteInfo.assessorderkey , formId,
                      '/pages/order-detail/order-detail?id=' + orderId, JSON.stringify(postJsonString));
                  }
                  app.saveReponseHeader(res);
                  wx.hideLoading();
                }
              })
            }
          }
      })
    },
    /*
    submitReputation: function (e) {
      let that = this;
      let formId = e.detail.formId;
      let postJsonString = {};
      postJsonString.token = app.globalData.token;
      postJsonString.orderId = this.data.orderId;
      let reputations = [];
      let i = 0;
      while (e.detail.value["orderGoodsId" + i]) {
        let orderGoodsId = e.detail.value["orderGoodsId" + i];
        let goodReputation = e.detail.value["goodReputation" + i];
        let goodReputationRemark = e.detail.value["goodReputationRemark" + i];

        let reputations_json = {};
        reputations_json.id = orderGoodsId;
        reputations_json.reputation = goodReputation;
        reputations_json.remark = goodReputationRemark;

        reputations.push(reputations_json);
        i++;
      }
      postJsonString.reputations = reputations;
      wx.showLoading();
      wx.request({
        url: app.globalData.urls + '/order/reputation',
        data: {
          postJsonString: postJsonString
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data.code == 0) {
            that.onShow();
            // 模板消息，通知用户已评价
            let postJsonString = {};
            postJsonString.keyword1 = { value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177' }
            let keywords2 = '感谢您的评价，期待您的再次光临！';
            //if (app.globalData.order_reputation_score) {
            //  keywords2 += app.globalData.order_reputation_score + '积分奖励已发放至您的账户。';
            //}
            postJsonString.keyword2 = { value: keywords2, color: '#173177' }
            app.sendTempleMsgImmediately(app.siteInfo.successorderkey , formId,
              '/pages/order-detail/order-detail?id=' + that.data.orderId, JSON.stringify(postJsonString));
          }
        }
      })
    }
    */
})