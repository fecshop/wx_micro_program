//获取应用实例
var app = getApp();
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

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
    //语言 - begin
    language: '',
    categoryId: '',
    //语言 - end
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
  setLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    //this.initStart();
  },
  changeLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    this.initStart();
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
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    this.initStart()
  },
  initStart: function() {
    var that = this;
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