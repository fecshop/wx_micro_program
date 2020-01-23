const app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
	data: {
    balance:0,
    freeze:0,
    score:0,
    score_sign_continuous:0,
    //语言 - begin
    language: '',
    //语言 - end
    tabClass: ["", "", "", "", ""],
    logged:true,
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

  onLoad: function () {
    var that = this;
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
  },
  loginAccount: function (jumpLogin) {
    var that = this;
    wx.showLoading({
      title: that.data.language.load_user_information,
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
          that.setData({
            logged: false
          })
          if (jumpLogin){
            wx.navigateTo({
              url: "/pages/login/login"
            })
          }
        }else{
          that.setData({
            logged: true
          })
        }
      }
    });
  },
  onReady(){
    // 发起登录验证
    this.loginAccount(true)
  },
  onShow() {
    this.loginAccount(false)
  },	
  getUserApiInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/detail',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            apiUserInfoMap: res.data.data
          });
        }
      }
    })
  },
  getUserAmount: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/amount',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            balance: res.data.data.balance,
            freeze: res.data.data.freeze,
            score: res.data.data.score
          });
        }
      }
    })
  },
  getInfo: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/config/get-value',
      data: {
        key: "mallinfo"
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            getInfo: res.data.data.value
          });
        }
      }
    })
  },
  checkScoreSign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/today-signed',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            score_sign_continuous: res.data.data.continuous
          });
        }
      }
    })
  },
	getUserInfo: function (cb) {
      var that = this
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.setData({
                userInfo: res.userInfo
              });
            }
          })
        }
      })
},
  scoresign: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/score/sign',
      data: {
        token: app.globalData.token
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.getUserAmount();
          that.checkScoreSign();
        } else {
          wx.showModal({
            title: '错误',
            content: res.data.msg,
            showCancel: false
          })
        }
      }
    })
  },
  relogin:function(){
    var that = this;
    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        app.globalData.token = null;
        app.login();
        wx.showModal({
          title: '提示',
          content: '重新登陆成功',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              that.onShow();
            }
          }
        })
      },
      fail(res){
        //console.log(res);
        wx.openSetting({});
      }
    })
  },
	score: function () {
	  wx.navigateTo({
	    url: "/pages/score/score"
	  })
	},
})