//app.js

import locales from './utils/locales'
import T from './utils/i18n'

App({
  // 初始化url和设备
	onLaunch: function() {
		var that = this;
		that.urls();
		wx.getSystemInfo({
			success: function(res) {
				if (res.model.search("iPhone X") != -1) {
					that.globalData.iphone = true;
				}
				if (res.model.search("MI 8") != -1) {
					that.globalData.iphone = true;
				}
			}
		});
		//that.login()
    
    // 初始化货币
    var fecshop_currency = wx.getStorageSync('fecshop-currency');
    if (!fecshop_currency) {
      var currency_code = that.siteInfo.currency_code;
      wx.setStorageSync('fecshop-currency', currency_code);
    }
    // 初始化语言
    T.registerLocale(locales);	// (1)
    var fecshop_lang = wx.getStorageSync('fecshop-lang');
    if (!fecshop_lang) {
      fecshop_lang = that.siteInfo.lang_code;
      wx.setStorageSync('fecshop-lang', fecshop_lang);
    }
    T.setLocaleByCode(fecshop_lang);	// (2)
    wx.T = T;	// (3)
    // 初始化语言 - 完成
	},
	urls: function() {
		var that = this;
		that.globalData.urls = that.siteInfo.url + that.siteInfo.subDomain;
		that.globalData.share = that.siteInfo.shareProfile;
	},
	siteInfo: require("config.js"),
  /*
	login: function () {
	  var that = this;
	  var token = that.globalData.token;
	  if (token) {
	    wx.request({
	      url: that.globalData.urls + "/user/check-token",
	      data: {
	        token: token
	      },
	      success: function (res) {
	        if (res.data.code != 0) {
	          that.globalData.token = null;
	          that.login();
	        }
	      }
	    });
	    return;
	  }
	  wx.login({
	    success: function (res) {
	      wx.request({
          url: that.globalData.urls + "/wx/account/login",  // "/user/wxapp/login",
	        data: {
	          code: res.code
	        },
	        success: function (res) {
	          if (res.data.code == 1e4) {
	            that.globalData.usinfo = 0;
	            return;
	          }
	          if (res.data.code != 200) {
	            wx.hideLoading();
	            wx.showModal({
	              title: "提示",
	              content: "无法登录，请重试",
	              showCancel: false
	            });
	            return;
	          }
	          that.globalData.token = res.data.data.token;
	          that.globalData.uid = res.data.data.uid;
	        }
	      });
	    }
	  });
	},
  */
	sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
	  var that = this;
	  wx.request({
	    url: that.globalData.urls + "/template-msg/put",
	    method: "POST",
	    header: {
	      "content-type": "application/x-www-form-urlencoded"
	    },
	    data: {
	      token: that.globalData.token,
	      type: 0,
	      module: "order",
	      business_id: orderId,
	      trigger: trigger,
	      template_id: template_id,
	      form_id: form_id,
	      url: page,
	      postJsonString: postJsonString
	    }
	  });
	},
	sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
	  var that = this;
	  wx.request({
	    url: that.globalData.urls + "/template-msg/put",
	    method: "POST",
	    header: {
	      "content-type": "application/x-www-form-urlencoded"
	    },
	    data: {
	      token: that.globalData.token,
	      type: 0,
	      module: "immediately",
	      template_id: template_id,
	      form_id: form_id,
	      url: page,
	      postJsonString: postJsonString
	    }
	  });
	},
	fadeInOut:function(that,param,opacity){
		var animation = wx.createAnimation({
			//持续时间800ms
      duration: 300,
      timingFunction: 'ease',
		})
		animation.opacity(opacity).step()
		var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    that.setData(json)
	},
  //
	isStrInArray:function(item, arr) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] == item) {
				return true;
			}
		}
		return false;
	},
  getRequestHeader: function(){
    var headers = {};
    // 从数据fecshop-data中取出来值
    console.log(headers);
    //var fecshop_uuid = wx.getStorageSync('fecshop-uuid');
    var fecshop_lang = wx.getStorageSync('fecshop-lang');
    var fecshop_currency = wx.getStorageSync('fecshop-currency');
    var fecshop_access_token = wx.getStorageSync('access-token');
    //if (fecshop_uuid) {
    //  headers['fecshop-uuid'] = fecshop_uuid;
    //}
    if (fecshop_lang) {
      headers['fecshop-lang'] = fecshop_lang;
    }
    if (fecshop_currency) {
      headers['fecshop-currency'] = fecshop_currency;
    }
    if (fecshop_access_token) {
      headers['access-token'] = fecshop_access_token;
    }
    console.log(headers);

    return headers;
  },
  getPostRequestHeader: function () {
    var headers = {};
    // 从数据fecshop-data中取出来值
    //var fecshop_uuid = wx.getStorageSync('fecshop-uuid');
    var fecshop_lang = wx.getStorageSync('fecshop-lang');
    var fecshop_currency = wx.getStorageSync('fecshop-currency');
    var fecshop_access_token = wx.getStorageSync('access-token');
    //if (fecshop_uuid) {
    //  headers['fecshop-uuid'] = fecshop_uuid;
    //}
    if (fecshop_lang) {
      headers['fecshop-lang'] = fecshop_lang;
    }
    if (fecshop_currency) {
      headers['fecshop-currency'] = fecshop_currency;
    }
    if (fecshop_access_token) {
      headers['access-token'] = fecshop_access_token;
    }
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    console.log(headers);

    return headers;
  },
  saveReponseHeader: function (request){

    //var fecshop_uuid = wx.getStorageSync('fecshop-uuid');
    var fecshop_access_token = wx.getStorageSync('access-token');
    var fecshop_lang = wx.getStorageSync('fecshop-lang');
    var fecshop_currency = wx.getStorageSync('fecshop-currency');

    var request_header = request.header;

    //var header_fecshop_uuid = request_header['Fecshop-Uuid'];
    //if (!header_fecshop_uuid) {
    //  header_fecshop_uuid = request_header['fecshop-uuid'];
    //}
    var header_access_token = request_header['Access-Token'];
    if (!header_access_token) {
      header_access_token = request_header['access-token'];
    }

    var header_fecshop_lang = request_header['Fecshop-Lang'];
    if (!header_fecshop_lang) {
      header_fecshop_lang = request_header['fecshop-lang'];
    }
    var header_fecshop_currency = request_header['Fecshop-Currency'];
    if (!header_fecshop_currency) {
      header_fecshop_currency = request_header['fecshop-currency'];
    }
    
    //if (header_fecshop_uuid && (header_fecshop_uuid != fecshop_uuid)) {
    //  wx.setStorageSync('fecshop-uuid', header_fecshop_uuid);
    //}
    if (header_access_token && (header_access_token != fecshop_access_token)) {
      wx.setStorageSync('access-token', header_access_token);
    }
    if (header_fecshop_lang && (header_fecshop_lang != fecshop_lang)) {
      wx.setStorageSync('fecshop-lang', header_fecshop_lang);
    }
    if (header_fecshop_currency && (header_fecshop_currency != fecshop_currency)) {
      wx.setStorageSync('fecshop-currency', header_fecshop_currency);
    }
    
  },
  
  // 设置页面底部的购物车产品个数
	getShopCartNum:function(){
		var that = this
		wx.getStorage({
		  key: 'shopCarInfo',
		  success: function (res) {
		    if (res.data) {
		      if (res.data.shopNum > 0) {
            console.log("res.data.shopNum")
            console.log(res.data.shopNum)
		        wx.setTabBarBadge({
		          index: 2,
		          text: '' + res.data.shopNum + ''
		        })
		      } else {
		        wx.removeTabBarBadge({
		          index: 2,
		        })
		      }
		    } else {
		      wx.removeTabBarBadge({
		        index: 2,
		      })
		    }
		  }
		})
	},
	globalData: {
		userInfo: null
	}
})
