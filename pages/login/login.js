const app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    balance: 0,
    freeze: 0,
    score: 0,
    loadAccount: 1,
    //语言 - begin
    language: '',
    reRequestCount: 0,
    //语言 - end
    score_sign_continuous: 0,
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    tabClass: ["", "", "", "", ""]
  },
  onLoad: function () {
    var that = this;
    //that.getUserApiInfo();
    //that.getUserAmount();
    //that.checkScoreSign();
    //that.getInfo();
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.setLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    // 查看是否登陆，如果登陆，则跳转到 page/my/my, 如果没有登陆，则进行微信登陆。
    that.loginAccount();
  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    //this.initCategory();
  },
  // 
  loginAccount: function(){
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
        // 如果已经登陆，则跳转page/my/my
        if (res.data.code == '1100006') {
          wx.navigateBack({
            delta: 1
          });
          //wx.navigateTo({
          //  url: "/pages/my/my"
          //})
        } else if (res.data.code == '200')  {  // 如果没有登陆，则进行微信登陆，获取code
          that.wxLogin()
        }
        app.saveReponseHeader(res);
      }
    });


  },
  wxLogin: function(){
    var that = this;

    let msg = that.data.language.logging_in;
    if (that.data.reRequestCount>0){
      msg = that.data.language.retrying + that.data.reRequestCount;
    }

    wx.showLoading({
      title: msg,
    })
    wx.login({
      success: function (res) {
        wx.request({
          url: app.globalData.urls + "/customer/login/wxcode",  // "/user/wxapp/login",
          header: app.getPostRequestHeader(),
          method: 'POST',
          data: {
            code: res.code
          },
          success: function (res) {
            wx.hideLoading();
            wx.hideLoading();
            app.saveReponseHeader(res);

            if (res.data.code == '1100025') { // 没有相关用户，需要绑定
              that.setData({
                loadAccount: 2,
              });
              return
            }
            if (res.data.code == '200') { // 登陆成功，进行跳转
              wx.navigateBack({
                delta: 1
              });
              //that.globalData.uid = res.data.data.uid;
              //wx.navigateTo({
              //  url: "/pages/my/my"
              //})
            } else { // 其他的失败情况，重新进行登陆操作，最大5次
              // 如果获取微信数据失败，则重复获取，最大5次
              
              var reRequestCount = that.data.reRequestCount;
              that.setData({
                reRequestCount: reRequestCount + 1,
              });
              if (reRequestCount < 6) {
                // wx.showModal({
                //   title: "提示",
                //   content: "微信登录失败，重试中",
                //   showCancel: false
                // });
                that.wxLogin();
              } else {
                wx.showModal({
                  title: "提示",
                  content: "微信登录失败",
                  showCancel: false
                });
              }
              that.setData({
                loadAccount: 3,
              });
              return;
            }
          }
        });
      }
    });
  },

  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    if(!_datasetId){
      return
    }
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },

  onShow() {
    //this.loginAccount();
    if (this.data.loadAccount == 3) {
      this.wxLogin()
    }
  },

  bindNewSave: function (e) {
    var that = this;
    var email = e.detail.value.email;
    var password = e.detail.value.password;
    that.bindSave(email, password, 1)

  },

  bindHistorySave: function (e) {
    var that = this;
    var email = e.detail.value.email;
    var password = e.detail.value.password;
    that.bindSave(email, password, 2)
  },
  // 判断邮箱格式
  validateEmail : function (email) {
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    return myreg.test(email)
  },
  bindSave: function(email, password, isBindNew){
    var that = this;
    if (email == "") {
      wx.showModal({
        title: '提示',
        content: 'email_can_not_empty',
        showCancel: false
      })
      return
    }
    if (!that.validateEmail(email)){
      wx.showModal({
        title: '提示',
        content: '邮箱格式不正确',
        showCancel: false
      })
      return
    }
    if (password == "") {
      wx.showModal({
        title: '提示',
        content: 'password_can_not_empty',
        showCancel: false
      })
      return
    }
    
    if (password.length < 6) {
      wx.showModal({
        title: '提示',
        content: '密码必须大于6',
        showCancel: false
      })
      return
    }
    wx.showLoading({
      title: 'loading...',
    })

    wx.login({
      success: function (res) {
        wx.request({
          url: app.globalData.urls + "/customer/login/bindaccount",  // "/user/wxapp/login",
          header: app.getPostRequestHeader(),
          method: 'POST',
          data: {
            email: email,
            password: password,
            isBindNew: isBindNew,
            code: res.code
          },
          success: function (res) {
            wx.hideLoading();
            app.saveReponseHeader(res);
            if (res.data.code == '1100026') {  // 无法通过微信api获取信息
              wx.showModal({
                title: "提示",
                content: "无法从Session中获取微信Openid，请重新绑定",
                showCancel: false
              });
              that.wxLogin()
              return;
            } else if (res.data.code == '1100027') { // 登陆成功，进行跳转
              wx.showModal({
                title: "提示",
                content: "您已经有绑定的账户",
                showCancel: false
              });
              return;
            } else if (res.data.code == '1100007') { // 没有相关用户，需要绑定
              wx.showModal({
                title: "提示",
                content: "注册账户失败: " + res.data.data.errors,
                showCancel: false
              });

            } else if (res.data.code == '1100029') { // 没有相关用户，需要绑定
              wx.showModal({
                title: "提示",
                content: "该邮箱已经存在，请点击`已有账户`，输入邮箱密码进行账户绑定",
                showCancel: false
              });


            } else if (res.data.code == '1100028') { // 没有相关用户，需要绑定
              wx.showModal({
                title: "提示",
                content: "用户的账户密码不正确，请重新输入",
                showCancel: false
              });
            } else if (res.data.code == '200') { // 没有相关用户，需要绑定
              //wx.navigateTo({
              //  url: "/pages/my/my"
              //})
              wx.navigateBack({
                delta: 1
              });
            } else {
              wx.showModal({
                title: "提示",
                content: "绑定失败，请重新绑定",
                showCancel: false
              });
              that.wxLogin()

            }

          }
        });
      }
    });
  }
})