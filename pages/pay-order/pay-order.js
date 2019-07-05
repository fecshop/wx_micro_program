//index.js
//获取应用实例
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 1, // 是否需要物流信息
    allGoodsPrice: 0,
    cartSymbol: '',
    yunPrice: 0,
    grandTotal: 0,
    goodsJsonStr: "",
    shippings: [],
    shippingMethods: [],
    shipping_method: '',
    shippingIndex: 0,
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，
    //语言 - begin
    language: '',
    //语言 - end

    hasNoCoupons: true,
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
  },
  onShow: function () {
    //console.log(this.data.orderType)
    var that = this;
    var shopList = [];
    
    that.initCartInfo()
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
    this.initCartInfo()
  },


  onLoad: function (e) {
    //console.log(e)
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      //orderType: e.orderType
    });
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    that.loginAccount()
    //that.initCartInfo()
  },
  loginAccount: function () {
    var that = this;
    wx.showLoading({
      title: 'loading...',
    })
    wx.request({
      url: app.globalData.urls + '/customer/login/wxindex',
      header: app.getRequestHeader(),
      data: {},
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);
        // 如果已经登陆，则跳转page/my/my
        if (res.data.code != '1100006') {
          wx.navigateTo({
            url: "/pages/login/login"
          })
        }
      }
    });
  },
  initCartInfo: function () {
    var that = this;
    var shipping_method = this.data.shipping_method
    wx.showLoading();
    wx.request({
      url: app.globalData.urls + '/checkout/onepage/index',
      data: {
        // key: 'shopcart'
        shipping_method: shipping_method
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          var resAddress = res.data.data.cart_address
          if (resAddress.street1 && resAddress.telephone) {
            var curAddressData = {
              address: resAddress.street1,
              linkMan: resAddress.first_name + resAddress.last_name,
              mobile: resAddress.telephone,
            }
          }
          
          var goodsList = [];
          var cart_info = res.data.data.cart_info;
          var products = cart_info.products;
          if (products) {
            for (var x in products) {
              var product = products[x]
              var spu_options_str = ''
              var spu_options = product.spu_options
              if (spu_options) {
                for (var attr in spu_options) {
                  if (spu_options_str != '') {
                    spu_options_str += ', '
                  }
                  var val = spu_options[attr]
                  spu_options_str += attr + ': ' + val
                }
              }
              goodsList.push({
                pic: product.imgUrl,
                name: product.name,
                price: product.product_price,
                label: spu_options_str,
                number: product.qty,

              })
            }
          }
          // cart_info
          var cart_shippings = res.data.data.shippings;
          console.log(cart_shippings)
          var shippings = []
          var se = 0;
          var shippingIndex = 0;
          var shippingMethods = [];
          var sm = shipping_method;
          if (cart_shippings) {
            for (var s in cart_shippings) {
              var cart_shipping = cart_shippings[s]
              if (sm) {
                if (sm == cart_shipping.method) {
                  shippingIndex = se
                }
              } else if (cart_shipping.checked == true) {
                shippingIndex = se
                shipping_method = cart_shipping.method
              }
              shippingMethods[se] = cart_shipping.method;
              shippings[se] = cart_shipping.label + " " + cart_shipping.symbol + " " + cart_shipping.cost;
              se++;
            }
          }
          var hasNoCoupons = true
          var youhuijine = 0
          var curCoupon = ''
          if (cart_info.coupon_code) {
            hasNoCoupons = false;
            youhuijine = cart_info.coupon_cost
            curCoupon = cart_info.coupon_code
          }
          console.log(shippings)
          that.setData({
            hasNoCoupons: hasNoCoupons,
            youhuijine: youhuijine, //优惠券金额
            curCoupon: curCoupon, // 当前选择使用的优惠券
            shipping_method: shipping_method,
            allGoodsPrice: res.data.data.cart_info.product_total,
            shippingMethods: shippingMethods,
            cartSymbol: res.data.data.currency_info.symbol,
            grandTotal: res.data.data.cart_info.grand_total,
            yunPrice: res.data.data.cart_info.shipping_cost,
            shippingIndex: shippingIndex,
            shippings: shippings,
            
            curAddressData: curAddressData,
            goodsList: goodsList
          })

          console.log("shippingIndex:~~")
          console.log(shippingIndex)
          app.saveReponseHeader(res);

        }
        wx.hideLoading();
      }
    })

  },

  
  couponCodeSet: function(event) {
    this.setData({
      curCoupon: event.detail.value
    })
  },

  
  cancelCoupon: function() {
    var that = this
    var coupon_code = that.data.curCoupon
    if (coupon_code == "") {
      wx.showModal({
        title: that.data.language.warning, //'友情提示',
        content: that.data.language.please_fill_your_coupon, //'请先您的优惠券码',
        showCancel: false
      })
      return;
    }
    wx.showLoading();
    wx.request({
      url: app.globalData.urls + '/checkout/cart/cancelcoupon',
      data: {
        // key: 'shopcart'
        coupon_code: coupon_code
      },
      header: app.getPostRequestHeader(),
      method: 'POST',
      success: function (res) {
        if (res.data.code == '200') {

        } else {  // 优惠券过期
          wx.showModal({
            title: that.data.language.warning, //'友情提示',
            content: that.data.language.cancel_coupon_fail, //'',
            showCancel: false
          })
        }
        app.saveReponseHeader(res);
        wx.hideLoading();
        that.initCartInfo()
      }
    })
  },

  addCoupon: function(){
    var that = this
    var coupon_code = that.data.curCoupon
    if (coupon_code == "") {
      wx.showModal({
        title: that.data.language.warning, //'友情提示',
        content: that.data.language.please_fill_your_coupon, //'请先您的优惠券码',
        showCancel: false
      })
      return;
    }
    wx.showLoading();
    wx.request({
      url: app.globalData.urls + '/checkout/cart/addcoupon',
      data: {
        // key: 'shopcart'
        coupon_code: coupon_code
      },
      header: app.getPostRequestHeader(),
      method: 'POST',
      success: function (res) {
        if (res.data.code == '200') {
          
        } else {  // 优惠券过期
          wx.showModal({
            title: that.data.language.warning, //'友情提示',
            content: that.data.language.add_coupon_fail, //'添加优惠券失败',
            showCancel: false
          })
        }
        app.saveReponseHeader(res);
        wx.hideLoading();
        that.initCartInfo()
      }
    })
  },

  // 
  changeShipping(e) {
    var that = this
    let index = e.detail.value;
    // 设置当前的Picker的LangIndex
    this.setData({	// (1)
      shippingIndex: index
    });

    console.log("shippingMethods:")
    console.log(index)
    console.log(this.data.shippingMethods)
    // 得到shipping_method,
    var shipping_method = this.data.shippingMethods[index];
    that.setData({
      shipping_method: shipping_method
    })
    console.log(shipping_method)
    
    that.initCartInfo()
  },

  /*
  postData.provinceId = that.data.curAddressData.provinceId;
      postData.cityId = that.data.curAddressData.cityId;
      if (that.data.curAddressData.districtId) {
        postData.districtId = that.data.curAddressData.districtId;
      }
      postData.address = that.data.curAddressData.address;
      postData.linkMan = that.data.curAddressData.linkMan;
      postData.mobile = that.data.curAddressData.mobile;
      postData.code = that.data.curAddressData.code;

  */

  getDistrictId: function (obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },
  
  createOrder: function (e) {
    wx.showLoading();
    var that = this;
    
    var remark = ""; // 备注信息
    if (e) {
      remark = e.detail.value.remark; // 备注信息 
    }
    
    var postData = {
      order_remark: remark,
      shipping_method: that.data.shipping_method,
    };
    if (that.data.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.hideLoading();
        wx.showModal({
          title: '友情提示',
          content: '请先设置您的收货地址！',
          showCancel: false
        })
        return;
      }
    }
    
    wx.request({
      url: app.globalData.urls + '/checkout/onepage/wxsubmitorder',
      method: 'POST',
      header: app.getPostRequestHeader(),
      data: postData, // 设置请求的 参数
      success: (res) => {
				// console.log(postData)
        wx.hideLoading();
        if (res.data.code == 1500002) {
          wx.showModal({
            title: '错误',
            content: res.data.data.error,
            showCancel: false
          })
          return;
        } else if (res.data.code != 200) {
          wx.showModal({
            title: '错误',
            content: '订单生成失败',
            showCancel: false
          })
          return;
        }
        app.saveReponseHeader(res);
        var orderIncrementId = res.data.data.increment_id;
        var grand_total = res.data.data.grand_total;
        var symbol = res.data.data.symbol;
        wx.navigateTo({
          url: "/pages/success/success?order=" + orderIncrementId + "&money=" + grand_total + "&symbol=" + symbol + "&id=" + orderIncrementId
        })

        // "/pages/success/success?order=" + res.data.data.orderNumber + "&money=" + res.data.data.amountReal + "&id=" + res.data.data.id


      }
    })
  },
  /*
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/shipping-address/default',
      data: {
        token: app.globalData.token
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            curAddressData: res.data.data
          });
        } else {
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },
  processYunfei: function () {
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }


      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }


      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":"' + carShopBean.propertyChildIds + '","logisticsType":0, "inviter_id":' + inviter_id + '}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    //console.log(goodsJsonStr);
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr
    });
    that.createOrder();
  },
  */
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/address-add/address-add"
    })
  },
  selectAddress: function () {
    wx.navigateTo({
      url: "/pages/address/address"
    })
  },
  
  /*
  getMyCoupons: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/discounts/my',
      data: {
        token: app.globalData.token,
        status: 0
      },
      success: function (res) {
        if (res.data.code == 0) {
          var coupons = res.data.data.filter(entity => {
            return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
          });
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },
  */
  /*
  bindChangeCoupon: function (e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  }
  */
})