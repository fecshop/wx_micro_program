//index.js
//获取应用实例
const app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
	data: {
		indicatorDots: true,
		autoplay: true,
		interval: 6000,
		duration: 800,
		swiperCurrent: 0,
		iphone:false,
		loadingHidden: false, // loading
		wxlogin: true,
		loadingMoreHidden: true,
		showSearch: true,
    goods:[],
    //语言 - begin
    language: '',
    languages: [],
    langIndex: 0,
    //语言 - end
    // 货币
    currencys: [],
    currencyCodes: [],
    currencyIndex: 0,


	},
	onShow(){
		var that = this
		// app.fadeInOut(this,'fadeAni',0)
    /*
		setTimeout(function () {
		  if (app.globalData.usinfo == 0) {
		    that.setData({
		      wxlogin: false
		    })
		    wx.hideTabBar();
		  }
		}, 800)
    */
		//获取购物车商品数量
		app.getShopCartNum()
	},
  // 语言 
  changeLanguage(e) {
    let index = e.detail.value;
    // 设置当前的Picker的LangIndex
    this.setData({	// (1)
      langIndex: index
    });
    // 设置Locale
    wx.T.setLocaleByIndex(index);
    // 设置language变量（翻译Object）
    this.setLanguage();
    
    // 写入Storage
    var fecshop_lang = wx.T.getCodeByIndex(index);
    wx.setStorageSync('fecshop-lang', fecshop_lang);
    // 添加事件
    event.emit('languageChanged');
    this.loadHomeData();
  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
  },
  loadHomeData: function() {
    var that = this;
    //4个热销广告位
    wx.request({
      url: app.globalData.urls + '/wx/home/index',
      header: app.getRequestHeader(),
      data: {},
      success: function (res) {
        if (res.data.code == 200) {
          that.setData({
            hot: res.data.data.hot
          });
          if (res.data.data.topgoods) {
            that.setData({
              topgoods: res.data.data.topgoods
            });
            that.setData({
              goods: res.data.data.products
            });
          }
          that.setData({
            banners: res.data.data.banners
          });
          // 货币
          that.initCurrency(res.data.data.currency)

          console.log(res.data.data.products)
          app.saveReponseHeader(res);
        }
      }
    })
  },
  // 货币
  getCurrencyIndex: function (currencyCodeList, currentCurrency) {
    for (var x in currencyCodeList) {
      if (currencyCodeList[x] == currentCurrency) {
        return x
      }
    }
  },
  // 货币
  initCurrency: function (currencyObj) {
    var that = this
    var currencyCodeList = currencyObj.currencyCodeList  // ["EUR", "USD", "GBP", "CNY"]
    var currencyList = currencyObj.currencyList  // ["€ EUR", "$ USD", "£ GBP", "￥ CNY"]
    var currentCurrency = currencyObj.currentCurrency  // "CNY"

    var currencyIndex = that.getCurrencyIndex(currencyCodeList, currentCurrency)

    that.setData({
      currencys: currencyList
    });
    that.setData({
      currencyCodes: currencyCodeList
    });
    that.setData({
      currencyIndex: currencyIndex
    });

  },
  // 货币  - 更改货币
  changeCurrency(e) {
    let index = e.detail.value;
    // 设置当前的Picker的LangIndex
    this.setData({	// (1)
      currencyIndex: index
    });
    // 添加事件
    event.emit('currencyChanged');
    // 写入Storage
    var currencyCodes = this.data.currencyCodes;
    var fecshop_currency = currencyCodes[index];
    wx.setStorageSync('fecshop-currency', fecshop_currency);
    this.loadHomeData();
  },
  
	onLoad: function() {
		var that = this;
    // 语言
    // 设置picker的语言选项
    that.setData({
      languages: wx.T.getLangNames()
    });
    // 设置picker的语言选项中当前的langIndex
    that.setData({
      "langIndex": wx.T.langIndex
    });
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束

		app.fadeInOut(this,'fadeAni',0)
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: true
			})
		}
    // ajax请求
    that.loadHomeData();

    /*
		//首页顶部Logo
		wx.request({
			url: app.globalData.urls + '/banner/list',
			data: {
				type: 'toplogo'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						toplogo: res.data.data[0].picUrl,
						topname: wx.getStorageSync('mallName')
					});
				}
			}
		})
		//首页幻灯片
		wx.request({
			url: app.globalData.urls + '/banner/list',
			data: {
				type: 'home'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						banners: res.data.data
					});
				}
			}
		})
		//4个功能展示位
		wx.request({
		  url: app.globalData.urls + '/banner/list',
		  data: {
		    key: 'mallName',
		    type: 'sale'
		  },
		  success: function (res) {
		    if (res.data.code == 0) {
		      that.setData({
		        sales: res.data.data
		      });
		    }
		  }
		})
		//4个热销广告位
		wx.request({
		  url: app.globalData.urls + '/banner/list',
		  data: {
		    type: 'hot'
		  },
		  success: function (res) {
		    if (res.data.code == 0) {
		      that.setData({
		        hot: res.data.data
		      });
		    }
		  }
		})
		//获取推荐商品信息
		wx.request({
		  url: app.globalData.urls + '/config/get-value',
		  data: {
		    key: 'topgoods'
		  },
		  success: function (res) {
		    if (res.data.code == 0) {
		      that.setData({
		        topgoods: res.data.data
		      });
		      wx.request({
		        url: app.globalData.urls + '/shop/goods/list',
		        data: {
		          recommendStatus: 1,
		          pageSize: 10
		        },
		        success: function (res) {
		          that.setData({
		            goods: [],
		            loadingMoreHidden: true
		          });
		          var goods = [];
		          if (res.data.code != 0 || res.data.data.length == 0) {
		            that.setData({
		              loadingMoreHidden: false,
		            });
		            return;
		          }
		          for (var i = 0; i < res.data.data.length; i++) {
		            goods.push(res.data.data[i]);
		          }
		          that.setData({
		            goods: goods,
		          });
		        }
		      })
		    }
		  }
		})

    */
	},
	swiperchange: function(e) {
		this.setData({
			swiperCurrent: e.detail.current
		})
	},
	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	tapBanner: function(e) {
		if (e.currentTarget.dataset.id != 0) {
			wx.navigateTo({
				url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
			})
		}
	},
	tapSales: function (e) {
	  if (e.currentTarget.dataset.id != 0) {
	    wx.navigateTo({
	      url: e.currentTarget.dataset.id
	    })
	  }
	},
	userlogin: function (e) {
	  var that = this;
	  var iv = e.detail.iv;
	  var encryptedData = e.detail.encryptedData;
	  wx.login({
	    success: function (wxs) {
	      wx.request({
	        url: app.globalData.urls + '/user/wxapp/register/complex',
	        data: {
	          code: wxs.code,
	          encryptedData: encryptedData,
	          iv: iv
	        },
	        success: function (res) {
	          if (res.data.code != 0) {
	            wx.showModal({
	              title: '温馨提示',
	              content: '需要您的授权，才能正常使用哦～',
	              showCancel: false,
	              success: function (res) { }
	            })
	          } else {
	            that.setData({ wxlogin: true })
	            app.login();
	            wx.showToast({
	              title: '授权成功',
	              duration: 2000
	            })
	            app.globalData.usinfo = 1;
	            wx.showTabBar();
	          }
	        }
	      })
	    }
	  })
	},
	onPageScroll: function(t) {
		if(t.scrollTop >= 180){
			wx.setNavigationBarColor({
				frontColor: '#000000',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this,'fadeAni',1)
		}else{
			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this,'fadeAni',0)
		}
	}
})
