//index.js
//获取应用实例
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    //语言 - begin
    language: '',
    //语言 - end
    delBtnWidth: 120, 
  },
  onLoad: function () {
    //that.loadCartInfo();
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },
  home: function () {
    wx.switchTab({
      url: "/pages/index/index"
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
  },
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    this.onShow()
  },
  onShow: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/customer/productfavorite/index',
      data: {},
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          var favList = []; 
          var products = res.data.data.productList;
          var ii = 0;
          for (var x in products) {
            var product = products[x]
            favList.push({
              goodsName: product.name,
              goodsId: product.product_id,
              pic: product.imgUrl,
              dateAdd: product.updated_at,
            })
            ii++
          }
          if (ii == 0) {
            that.setData({
              favList: null,
              loadingMoreHidden: false
            });
            return
          }
          
          that.setData({
            favList: favList,
            loadingMoreHidden: true
          });
        } else{
          that.setData({
            favList: null,
            loadingMoreHidden: false
          });
        }
      }
    })
  }


  
})