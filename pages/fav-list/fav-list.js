//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
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
          for (var x in products) {
            var product = products[x]
            favList.push({
              goodsName: product.name,
              goodsId: product.product_id,
              pic: product.imgUrl,
              dateAdd: product.updated_at,
            })
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