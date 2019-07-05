var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    currencySymbol: '',
    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      currencySymbol: '',
      allSelect: true,
      noSelect: false,
      //语言 - begin
      language: '',
      //语言 - end
      list: []
    },
    //语言 - begin
    language: '',
    //语言 - end
    delBtnWidth: 120,    //删除按钮宽度单位（rpx）
  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    
    that.initEleWidth();
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束

    //that.onShow();
  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    var goodsList = this.data.goodsList
    goodsList.language = this.data.language
    this.setData({
      goodsList: goodsList
    });
    //this.loadCartInfo()
  },
  // 语言 
  // 设置language变量（翻译Object）
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    var goodsList = this.data.goodsList
    goodsList.language = this.data.language
    this.setData({
      goodsList: goodsList
    });
    this.loadCartInfo()
  },
  loadCartInfo: function(){
    var that = this;
    wx.request({
      url: app.globalData.urls + '/checkout/cart/index',
      data: {
        // key: 'shopcart'
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          var cart_info = res.data.data.cart_info;
          var currency = res.data.data.currency;
          var goodsList = {
            saveHidden: true,
            totalPrice: 0,
            language: that.data.language,
            currencySymbol: '',
            allSelect: true,
            noSelect: true,
            list: []
          };
          if (cart_info) {
            goodsList.totalPrice = cart_info.grand_total;
            goodsList.currencySymbol = currency.symbol;
            that.setData({
              currencySymbol: currency.symbol
            });
            var products = cart_info.products;
            var productList = [];
            var allSelect = true;
            var noSelect = true;
            for (var x in products) {
              var product = products[x];
              //var spu_options = product.spu_options
              var product_active = '';
              if (product.active == 1) {
                product_active = 'active';
                noSelect = false
              } else {
                allSelect = false
              }
              productList.push({
                name: product.name,
                label: product.spu_options_str,
                price: product.product_price,
                active: product_active,
                pic: product.img_url,
                item_id: product.item_id,
                number: product.qty
              });
            }
            goodsList.list = productList;
            goodsList.allSelect = allSelect;
            goodsList.noSelect = noSelect;
            that.setData({
              goodsList: goodsList
            });

            var items_count = cart_info.items_count;
            var shopCarInfo = {}
            shopCarInfo.shopNum = items_count
            wx.setStorage({
              key: "shopCarInfo",
              data: shopCarInfo
            })
            console.log(shopCarInfo)
            app.getShopCartNum()

          }
          app.saveReponseHeader(res);

        }
      }
    })
  },
  onShow: function () {
    var that = this;
    that.loadCartInfo();
    
  },
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },

  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    var index = e.currentTarget.dataset.index;

    if (e.touches.length == 1) {
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      } else if (disX > 0) {//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          left = "left:-" + delBtnWidth + "px";
        }
      }
      var list = this.data.goodsList.list;
      if (index != "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }
  },

  touchE: function (e) {
    var index = e.currentTarget.dataset.index;
    if (e.changedTouches.length == 1) {
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? "margin-left:-" + delBtnWidth + "px" : "margin-left:0px";
      var list = this.data.goodsList.list;
      if (index !== "" && index != null) {
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

      }
    }
  },
  delItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    list.splice(index, 1);
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);

    var item_id = e.currentTarget.dataset.itemid;
    var that = this;
    wx.request({
      url: app.globalData.urls + '/checkout/cart/updateinfo',
      method: 'POST',
      data: {
        "up_type": "remove",
        item_id: item_id
      },
      header: app.getPostRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          app.saveReponseHeader(res);
          that.loadCartInfo();
        }
      }
    })


  },
  selectTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index)].active = !list[parseInt(index)].active;
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
    var checked = list[parseInt(index)].active ? 1 : 0
    var item_id = e.currentTarget.dataset.itemid;
    var that = this;
    wx.request({
      url: app.globalData.urls + '/checkout/cart/selectone',
      method: 'GET',
      data: {
        checked: checked,
        item_id: item_id
      },
      header: app.getPostRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          app.saveReponseHeader(res);
          that.loadCartInfo();
        }
      }
    })
  },
  totalPrice: function () {
    var list = this.data.goodsList.list;
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number;
      }
    }
    total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
    return total;
  },
  allSelect: function () {
    var list = this.data.goodsList.list;
    var allSelect = false;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    
    return allSelect;
  },
  noSelect: function () {
    var list = this.data.goodsList.list;
    var noSelect = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (!curItem.active) {
        noSelect++;
      }
    }

    
    
    if (noSelect == list.length) {
      return true;
    } else {
      return false;
    }
  },
  setGoodsList: function (saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        currencySymbol: this.data.currencySymbol,
        allSelect: allSelect,
        noSelect: noSelect,
        language: this.data.language,
        list: list
      }
    });
  },
  bindAllSelect: function () {
    var currentAllSelect = this.data.goodsList.allSelect;
    var list = this.data.goodsList.list;
    if (currentAllSelect) {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = false;
      }
    } else {
      for (var i = 0; i < list.length; i++) {
        var curItem = list[i];
        curItem.active = true;
      }
    }

    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);

    console.log("currentAllSelect")
    console.log(currentAllSelect)
    
    var checked = !currentAllSelect ? 1 : 0;
    var that = this;
    wx.request({
      url: app.globalData.urls + '/checkout/cart/selectall',
      method: 'GET',
      data: {
        checked: checked
      },
      header: app.getPostRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          app.saveReponseHeader(res);
          that.loadCartInfo();
        }
      }
    })
    
  },
  // 减少个数
  jiaBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number < 10) {
        list[parseInt(index)].number++;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }

    var item_id = e.currentTarget.dataset.itemid;

    var that = this;
    wx.request({
      url: app.globalData.urls + '/checkout/cart/updateinfo',
      method: 'POST',
      data: {
        // key: 'shopcart'
        "up_type": "add_one",
        item_id: item_id
      },
      header: app.getPostRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          app.saveReponseHeader(res);
          that.loadCartInfo();
        }
      }
    })


  },
  jianBtnTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      if (list[parseInt(index)].number > 1) {
        list[parseInt(index)].number--;
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
    }

    var item_id = e.currentTarget.dataset.itemid;
    var that = this;
    wx.request({
      url: app.globalData.urls + '/checkout/cart/updateinfo',
      method: 'POST',
      data: {
        // key: 'shopcart'
        "up_type": "less_one",
        item_id: item_id
      },
      header: app.getPostRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          app.saveReponseHeader(res);
          that.loadCartInfo();
        }
      }
    })
  },
  editTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = false;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  saveTap: function () {
    var list = this.data.goodsList.list;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      curItem.active = true;
    }
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
  },
  getSaveHide: function () {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },
  deleteSelected: function () {
    var list = this.data.goodsList.list;
    /*
     for(let i = 0 ; i < list.length ; i++){
           let curItem = list[i];
           if(curItem.active){
             list.splice(i,1);
           }
     }
     */
    // above codes that remove elements in a for statement may change the length of list dynamically
    list = list.filter(function (curGoods) {
      return !curGoods.active;
    });
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
		
    
    //更新tabbar购物车数字角标
		app.getShopCartNum()
  },
  toPayOrder: function () {
    this.navigateToPayOrder();
  },
  navigateToPayOrder: function () {
    wx.hideLoading();
    wx.navigateTo({
      url: "/pages/pay-order/pay-order?orderType=cart"
    })
  }
})
