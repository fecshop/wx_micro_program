//获取应用实例
var app = getApp();
function countdown(that) {
  var second = that.data.second;
  var home = that.data.home;
  if (home == 0) {
    if (second == 0) {
      wx.switchTab({
        url: '../index/index'
      })
    }
  }
  var time = setTimeout(function () {
    that.setData({
      second: second - 1
    });
    countdown(that);
  }
    , 1000)

}
Page({
  data: {
    second: 6,
    home: 0
  },

  goHome: function () {
    this.setData({
      home: 1
    });
    wx.switchTab({
      url: '../index/index'
    })
  },
  tapBanner: function (e) {
    if (e.currentTarget.dataset.id != 0) {
      this.setData({
        home: 1
      });
      wx.redirectTo({
        url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id + '&share=1'
      })
    }
  },
  onLoad: function () {
    var that = this;
    countdown(that);
    //var request_header = app.getRequestHeader();
    //console.log(request_header);
    wx.request({
      url: app.globalData.urls + '/wx/start/first', //  '/banner/list',
      header: app.getRequestHeader(),
      data: {
        key: 'mallName',
        type: 'start'
      },
      success: function (res) {
        if (res.data.code == 200) {
          console.log(res.data.data.picUrl)
          that.setData({
            sales: res.data.data
          });
          app.saveReponseHeader(res); 
          //header
        }
      }
    })

  }
});