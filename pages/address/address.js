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
    addressList:[]
  },

  selectTap: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.urls +'/customer/address/changedefault',
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        address_id:id
      },
      success: (res) =>{
        app.saveReponseHeader(res);
        wx.navigateBack({})
      }
    })
  },

  addAddess : function () {
    wx.navigateTo({
      url:"/pages/address-add/address-add"
    })
  },
  
  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/address-add?id=" + e.currentTarget.dataset.id
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
    this.initShippingAddress()
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.setLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
  },
  onShow : function () {
    this.initShippingAddress();
  },
  initShippingAddress: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls +'/checkout/onepage/getaddresslist',
      header: app.getRequestHeader(),
      data: { },
      success: (res) =>{
        if (res.data.code == 200) {
          var addressColl = res.data.data.addressList
          var addressList = []
          for (var x in addressColl) {
            var addressOne = addressColl[x]
            var addressInfo = addressOne.address_info
            addressList.push({
              id: addressInfo.address_id,
              isDefault: addressOne.is_default == "1" ? true : false,
              linkMan: addressInfo.first_name + addressInfo.last_name,
              mobile: addressInfo.telephone,
              provinceStr: addressInfo.state,
              cityStr: addressInfo.city,
              areaStr: addressInfo.area,
              address: addressInfo.street1,
            })
          }
          console.log(addressList)
          that.setData({
            addressList: addressList,
            loadingMoreHidden: true
          });
        } else if (res.data.code == 700){
          that.setData({
            addressList: null,
            loadingMoreHidden: false
          });
        }
        app.saveReponseHeader(res);
      }
    })
  }

})
