//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    autoplay: true,
    interval: 10000,
    duration: 500,
    goodsDetail: {},
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "",
    selectSizePrice: 0,
    shopNum: 0,
    //语言 - begin
    language: '',
    //语言 - end
    hideShopPopup: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 50,
    favicon: 0,
    selectptPrice: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    wxlogin: true,
    sharecode: true,
    sharebox: true,
		title:"商品详情",
    barBg: 'red',
		color: '#ffffff'
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    //this.getProductDetails()
  },
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    this.getProductDetails()
  },
  onLoad: function (e) {
    var that = this;
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    
    if (!e.id) { //扫码进入
      var scene = decodeURIComponent(e.scene);
      if (scene.length > 0 && scene != undefined) {
        var scarr = scene.split(',');
        var dilist = [];
        for (var i = 0; i < scarr.length; i++) {
          dilist.push(scarr[i].split('='))
        }
        if (dilist.length > 0) {
          var dict = {};
          for (var j = 0; j < dilist.length; j++) {
            dict[dilist[j][0]] = dilist[j][1]
          }
          var id = dict.i;
          var vid = dict.u;
          var sid = dict.s;
          that.setData({
            id: id
          })
          if (vid) {
            wx.setStorage({
              key: 'inviter_id_' + id,
              data: vid
            })
          }
          if (sid) { that.setData({ share: sid }); }
        }
      }
    }
    if (!e.scene) { //链接进入
      if (e.inviter_id) {
        wx.setStorage({
          key: 'inviter_id_' + e.id,
          data: e.inviter_id
        })
      }
      if (e.share) { that.setData({ share: e.share }); }
      that.setData({
        id: e.id
      })
    }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    this.getProductDetails()
    this.getfav();
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        //console.log("shopCarInfo>>>")
        //console.log(res.data)
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
  },
  getProductDetails: function() {
    var that = this
    wx.request({
      url: app.globalData.urls + '/catalog/product/index',  // '/shop/goods/detail',
      header: app.getRequestHeader(),
      data: {
        product_id: that.data.id
      },
      success: function (res) {
        // console.log(res)
        var selectSizeTemp = "";
        var goodsDetail = res.data.data.product;
        if (!goodsDetail) {
          wx.showModal({
            title: that.data.language.error,
            content: res.data.message,
            showCancel: false,
            success(res){
              // 返回上一层
              wx.navigateBack()
            }
          })
          return
        }
        var is_custom_option_empty = true;
        // 判断是否为空
        if (goodsDetail.custom_option) {
          for (var x in goodsDetail.custom_option) {
            is_custom_option_empty = false;
          }
        }
        
        if (!is_custom_option_empty || goodsDetail.options.length != 0) {
          for (var i = 0; i < goodsDetail.options.length; i++) {
            selectSizeTemp = selectSizeTemp + " " + goodsDetail.options[i].label;
          }
          that.setData({
            hasMoreSelect: true,
            selectSize: that.data.selectSize + selectSizeTemp,
            // selectSizePrice: res.data.data.product.price_info.special_price, // 该设定与下6行重复
            selectptPrice: res.data.data.product.price_info.price
          });
        }
        
        that.setData({
          goodsDetail: res.data.data.product,
          selectSizePrice: res.data.data.product.price_info.special_price ? res.data.data.product.price_info.special_price:0,
          buyNumber: 1,  //(res.data.data.basicInfo.stores > 0) ? 1 : 0,
        });
        WxParse.wxParse('article', 'html', res.data.data.product.description, that, 5);
        app.saveReponseHeader(res);
      }
    });
  },
  
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/cart/cart"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  // options 跳转
  labelOptionsItemTap: function (event) {
    var optionid = event.currentTarget.dataset.optionid
    this.setData({
      id: optionid,
      selectSize: this.data.language.select_attribute
    })
    this.getProductDetails()
    //wx.navigateTo({
    //  url: '/pages/goods-detail/goods-detail?id=' + optionid
    //})

  },

  /**
   * 选择商品规格
   * @param {Object} e
   */
  labelItemTap: function (e) {
    var that = this;
    // 取消该分类下的子栏目所有的选中状态
    var childs = that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
    for (var i = 0; i < childs.length; i++) {
      that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = false;
    }
    // 设置当前选中状态
    that.data.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = true;
    // 获取所有的选中规格尺寸数据
    var needSelectNum = that.data.goodsDetail.properties.length;
    var curSelectNum = 0;
    var propertyChildIds = "";
    var propertyChildNames = "";
    for (var i = 0; i < that.data.goodsDetail.properties.length; i++) {
      childs = that.data.goodsDetail.properties[i].childsCurGoods;
      for (var j = 0; j < childs.length; j++) {
        if (childs[j].active) {
          curSelectNum++;
          propertyChildIds = propertyChildIds + that.data.goodsDetail.properties[i].id + ":" + childs[j].id + ",";
          propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":" + childs[j].name + "  ";
        }
      }
    }
    var canSubmit = false;
    if (needSelectNum == curSelectNum) {
      canSubmit = true;
    }
    // 计算当前价格
    if (canSubmit) {
      wx.request({
        url: app.siteInfo.url + app.siteInfo.subDomain + '/shop/goods/price',
        data: {
          goodsId: that.data.goodsDetail.basicInfo.id,
          propertyChildIds: propertyChildIds
        },
        success: function (res) {

          that.setData({
            selectSizePrice: res.data.data.price,
            propertyChildIds: propertyChildIds,
            propertyChildNames: propertyChildNames,
            buyNumMax: res.data.data.stores,
            buyNumber: (res.data.data.stores > 0) ? 1 : 0,
            selectptPrice: res.data.data.pingtuanPrice
          });
        }
      })
    }

    this.setData({
      goodsDetail: that.data.goodsDetail,
      canSubmit: canSubmit
    })

  },
  /**
  * 加入购物车
  */
  addShopCar: function () {
    var that = this
    if (that.data.buyNumber < 1) {
      wx.showModal({
        title: that.data.language.tips,
        content: that.data.language.buy_amount_min + "1" + that.data.language.item,
        showCancel: false
      })
      return;
    }
    
    wx.showLoading({
      title: 'loading...',
    })
    var requestHeader= app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/checkout/cart/add',
      method: 'POST',
      header: requestHeader,
      data: {
        qty: that.data.buyNumber,
        product_id: that.data.goodsDetail._id
      },
      success: function (res) {
        if (res.data.code == 200) {
          var qty = res.data.data.items_count;
          var shopCarInfo = {}
          shopCarInfo.shopNum = qty
          that.setData({
            shopNum: qty,
          })
          wx.setStorage({
            key: "shopCarInfo",
            data: shopCarInfo
          })
          console.log(shopCarInfo)
          app.getShopCartNum()
          //that.bindGuiGeTap();
          wx.showToast({
            title: that.data.language.add_to_cart_success ,
            icon: 'success',
            duration: 2000
          });
          that.closePopupTap();
        } else if (res.data.code == 1100003) {
          wx.navigateTo({
            url: "/pages/login/login"
          })
        } else {
          wx.showModal({
            title: that.data.language.error,
            content: that.data.language.add_to_cart_fail,
            showCancel: false
          })
        }
      }
    })
  },
	/**
	  * 立即购买
	  */
  buyNow: function () {
    var that = this
    if (that.data.buyNumber < 1) {
      wx.showModal({
        title: that.data.language.tips,
        content: that.data.language.buy_amount_min + "1" + that.data.language.item,
        showCancel: false
      })
      return;
    }
    
    wx.showLoading({
      title: 'loading...',
    })
    var requestHeader = app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/checkout/cart/add',
      method: 'POST',
      header: requestHeader,
      data: {
        qty: that.data.buyNumber,
        buy_now: 1,
        product_id: that.data.goodsDetail._id
      },
      success: function (res) {
        if (res.data.code == 200) {
          var qty = res.data.data.items_count;
          var shopCarInfo = {}
          shopCarInfo.shopNum = qty
          that.setData({
            shopNum: qty,
          })
          wx.setStorage({
            key: "shopCarInfo",
            data: shopCarInfo
          })
          console.log(shopCarInfo)
          app.getShopCartNum()
          //that.bindGuiGeTap();
          wx.showToast({
            title: that.data.language.add_to_cart_success,
            icon: 'success',
            duration: 2000
          });
          that.closePopupTap();
          wx.navigateTo({
            url: "/pages/pay-order/pay-order?orderType=buyPT"
          })
        } else if (res.data.code == 1100003) {
          wx.navigateTo({
            url: "/pages/login/login"
          })
        } else {
          wx.showModal({
            title: that.data.language.error,
            content: that.data.language.add_to_cart_fail,
            showCancel: false
          })
        }
      }
    }) 
  },
  
	/**
	 * 组建立即购买信息
	 */
  buliduBuyNowInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectSizePrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  bulidupingTuanInfo: function () {
    var shopCarMap = {};
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCarMap.pingtuanId = this.data.pingtuanOpenId;
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic;
    shopCarMap.name = this.data.goodsDetail.basicInfo.name;
    // shopCarMap.label=this.data.goodsDetail.basicInfo.id; 规格尺寸 
    shopCarMap.propertyChildIds = this.data.propertyChildIds;
    shopCarMap.label = this.data.propertyChildNames;
    shopCarMap.price = this.data.selectptPrice;
    //this.data.goodsDetail.basicInfo.pingtuanPrice;
    shopCarMap.left = "";
    shopCarMap.active = true;
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId;
    shopCarMap.logistics = this.data.goodsDetail.logistics;
    shopCarMap.weight = this.data.goodsDetail.basicInfo.weight;

    var buyNowInfo = {};
    if (!buyNowInfo.shopNum) {
      buyNowInfo.shopNum = 0;
    }
    if (!buyNowInfo.shopList) {
      buyNowInfo.shopList = [];
    }
    buyNowInfo.shopList.push(shopCarMap);
    return buyNowInfo;
  },
  onShareAppMessage: function () {
    var that = this;
    that.setData({ sharebox: true })
    return {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-detail/goods-detail?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + app.globalData.uid + '&share=1',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  
  getfav: function () {
    //console.log(e)
    var that = this;
    var id = that.data.id
    wx.request({
      url: app.globalData.urls + '/catalog/product/getfav',
      data: {
        //nameLike: this.data.goodsDetail.basicInfo.name,
        //token: app.globalData.token
        product_id: id,
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          if (res.data.data.fav == 1) {
            that.setData({
              favicon: 1
            });
          }
        }
      }
    })
  },
  fav: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/catalog/product/favorite',
      data: {
        product_id: that.data.id,
        type: 'add',
        //token: app.globalData.token
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          /*
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            image: '../../images/active.png',
            duration: 2000
          })
          */
          wx.showToast({
            title: that.data.language.add_to_collection_success,
            duration: 2000
          })
          that.setData({
            favicon: 1
          });
        } else if (res.data.code == '1100003') {
          // 需要登陆
          wx.navigateTo({
            url: "/pages/login/login"
          })
        }
        app.saveReponseHeader(res);
      }
    })
  },
  del: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/catalog/product/favorite',
      data: {
        product_id: that.data.id,
        type: 'del',
        //token: app.globalData.token
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          /*
          wx.showToast({
            title: '取消收藏',
            icon: 'success',
            image: '../../images/error.png',
            duration: 2000
          })
          */
          wx.showToast({
            title: that.data.language.remove_for_collection_success,
            duration: 2000
          })

          that.setData({
            favicon: 0
          });
        } else if(res.data.code == '1100003') {
          // 需要登陆
          wx.navigateTo({
            url: "/pages/login/login"
          })
        }
        app.saveReponseHeader(res);
      }
    })
  },
  
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
      }
      //that.goPingtuan();
      //that.goPingList();
    }, 1000)
  },
  
  getShareBox:function(){
    this.setData({sharebox: false})
  },
  getcode: function () {
    var that = this;
    wx.showLoading({
      title: that.data.language.generating,
    })
    var product_id = that.data.goodsDetail._id
    wx.request({
      url: app.globalData.urls + '/wx/helper/qrcode',
      data: {
        scene: "i=" + product_id + ",u=" + app.globalData.uid + ",s=1",
        page: "pages/goods-detail/goods-detail",
        expireHours:1
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.downloadFile({
            url: res.data.data,
            success: function (res) {
              wx.hideLoading()
              that.setData({
                codeimg: res.tempFilePath,
                sharecode: false,
                sharebox: true
              });
            }
          })
        }
      }
    });
  },
  savecode: function () {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.codeimg,
      success(res) {
        wx.showToast({
          title: that.data.language.save_success,
          icon: 'success',
          duration: 2000
        })
      }
    })
    that.setData({
      sharecode: true,
    })
  },
  closeshare: function () {
    this.setData({
      sharebox: true,
      sharecode: true
    })
  },
})
