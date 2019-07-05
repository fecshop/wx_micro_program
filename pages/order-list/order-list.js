var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    statusType: [], //["全部订单","待付款", "待发货", "待收货",  "已完成"], //["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType: 0,
    tabClass: ["", "", "", "", ""],
    //语言 - begin
    language: '',
    //语言 - end

		bodyHeight:null
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
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    //this.initCartInfo()
  },
  statusTap: function (e) {
    var obj = e;
    var count = 0;
    for (var key in obj) {
      count++;
    }
    if (count == 0) {
      var curType = 0;
    } else {
      console.log('出现Cannot read property "dataset" of undefined;这样的错误是正常的，不用管！');
      var curType = e.currentTarget.dataset.index;
    }
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  orderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-detail/order-detail?id=" + orderId + '&share=1'
    })
  },
  cancelOrderTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: that.data.language.is_sure_cancel_order   , //'确定要取消该订单吗？',  // Are you sure you want to cancel the order?
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.globalData.urls + '/customer/order/cancel',
            data: {
              orderId: orderId
            },
            header: app.getRequestHeader(),
            success: (res) => {
              wx.hideLoading();
              if (res.data.code == 200) {
                that.onShow();
              }
              app.saveReponseHeader(res);
            }
          })
        }
      }
    })
  },
  toPayTap: function (e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    wxpay.wxpay(app, money, orderId, "/pages/order-list/order-list?currentType=1&share=1");
  },
  onLoad: function (e) {
    var that = this;
    if (e.share) {
      that.setData({ share: e.share });
    }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    //statusType: ["全部订单", "待付款", "待发货", "待收货", "已完成"]
    that.setData({
      statusType: [
        that.data.language.all_order,
        that.data.language.order_wait_pay,
        that.data.language.order_wait_deliver,
        that.data.language.pending_receipt,
        that.data.language.order_complete,
      ]
    })

    var currentType = e.currentType;
    this.data.currentType = currentType;
    if (currentType) {
      that.setData({
        currentType: currentType
      });
    }
    that.statusTap(e);
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  /*
  getOrderStatistics: function () {
    var that = this;
    wx.request({
      url: app.siteInfo.url + app.siteInfo.subDomain + '/order/statistics',
      data: { token: app.globalData.token },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code == 0) {
          var tabClass = that.data.tabClass;
          if (res.data.data.count_id_no_pay > 0) {
            tabClass[0] = "red-dot"
          } else {
            tabClass[0] = ""
          }
          if (res.data.data.count_id_no_transfer > 0) {
            tabClass[1] = "red-dot"
          } else {
            tabClass[1] = ""
          }
          if (res.data.data.count_id_no_confirm > 0) {
            tabClass[2] = "red-dot"
          } else {
            tabClass[2] = ""
          }
          if (res.data.data.count_id_no_reputation > 0) {
            tabClass[3] = "red-dot"
          } else {
            tabClass[3] = ""
          }
          if (res.data.data.count_id_success > 0) {
            //tabClass[4] = "red-dot"
          } else {
            //tabClass[4] = ""
          }

          that.setData({
            tabClass: tabClass,
          });
        }
      }
    })
  },
  */
	toConfirmTap:function(e){
	  let that = this;
	  let orderId = e.currentTarget.dataset.id;
	  let formId = e.detail.formId;
	  wx.showModal({
      title: that.data.language.confirm_receive_product,  // '确认您已收到商品？',  // Confirm that you have received the item?
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
                  let keywords2 = that.data.language.confirm_and_next_come; // '您已确认收货，期待您的再次光临！';
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
  onShow: function (e) {
    // 获取订单列表
    wx.showLoading();
    var that = this;
    var postData = {
      //token: app.globalData.token
    };
    var requestStatus = that.data.currentType;
    var wxRequestOrderStatus = '';
    if (requestStatus == 0) {
      wxRequestOrderStatus = 'all'
    } else {
      wxRequestOrderStatus = requestStatus -1;
    }
    //this.getOrderStatistics();
    wx.request({
      url: app.globalData.urls + '/customer/order/index',
      data: {
        wxRequestOrderStatus: wxRequestOrderStatus,
        withItems: 1
      },
      header: app.getRequestHeader(),
      success: (res) => {
				console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          var orderList = res.data.data.orderList;
          var orderListThis = [];
          if (orderList) {
            for (var x in orderList) {
              var order = orderList[x];
              var order_status = order.order_status
              var statusStr = '';
              var status = 0;
              if (order_status == 'payment_pending' || order_status == 'payment_processing') {
                statusStr = that.data.language.order_wait_pay  //'待支付'
                status = 0
              } else if (order_status == 'payment_confirmed') {
                statusStr = that.data.language.order_wait_deliver   //'已支付待发货'
                status = 1
              } else if (order_status == 'payment_canceled') {
                statusStr = that.data.language.canceled  //'已取消'
                status = -1
              } else if (order_status == 'dispatched') {
                statusStr = that.data.language.pending_receipt  //'已发货待确认'
                status = 2
              } else if (order_status == 'completed') {
                statusStr = that.data.language.order_complete //'已完成'
                status = 3
              } 
              orderListThis.push({
                statusStr: statusStr,
                id: order.increment_id,
                status: status,
                orderNumber: order.increment_id,
                dateAdd: order.created_at,
                remark: order.remark,
                amountReal: order.grand_total,
                product_items: order.item_products,
                currency_symbol: order.currency_symbol
              })
            }
          }
          
          that.setData({
            orderList: orderListThis,
            //logisticsMap: res.data.data.logisticsMap,
            //goodsMap: res.data.data.goodsMap
          });
        } else {
          this.setData({
            orderList: null,
            //logisticsMap: {},
            //goodsMap: {}
          });
        }
        app.saveReponseHeader(res);
      }
    })
		var winInfo = wx.getSystemInfo({
			success: function (res) {
				var windowHeight = res.windowHeight;
				var statusBarHeight = res.statusBarHeight;
				var titleBarHeight = 0
				if (res.model.indexOf('iPhone') !== -1) {
					titleBarHeight = 44
				} else {
					titleBarHeight = 48
				}
				var query = wx.createSelectorQuery();
				query.select('.status-box').boundingClientRect()
				query.exec((res) => {
				  var listHeight = res[0].height; // 获取list高度
					that.setData({ bodyHeight: windowHeight - statusBarHeight - titleBarHeight - listHeight });
				})
				
			
			}
		});
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

  }
})