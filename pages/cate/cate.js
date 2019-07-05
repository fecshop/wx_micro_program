//index.js
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 8000,
    duration: 800,
    swiperCurrent: 0,
    selectCurrent: 0,
    activeCategoryId: 0,
    loadingMoreHidden: true,
    search: true,
    nonehidden: true,
    //语言 - begin
    language: '',
    //语言 - end
    searchidden: true,
    banner:{},
    categoriesListAll:[],
    categorieslist:[],
    categories:[]

  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    //this.initCategory();
  },
  changeLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    this.initCategory();
  },
  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  levelClick: function (e) {
    wx.navigateTo({
      url: "/pages/cate-list/cate-list?id=" + e.currentTarget.dataset.id
    })
  },
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  search: function(e){
    var that = this
    wx.request({
      url: app.globalData.urls + '/shop/goods/list',
      data: {
        nameLike: e.detail.value
      },
      success: function (res) {
        if (res.data.code == 0) {
          var searchs = [];
          for (var i = 0; i < res.data.data.length; i++) {
            searchs.push(res.data.data[i]);
          }
          that.setData({
            searchs: searchs,
            searchidden: false,
            nonehidden: true
          });
        }else{
          that.setData({
            searchidden: true,
            nonehidden: false
          });
        }
      }
    })
    
  },
  searchfocus: function(){
    this.setData({
      search: false,
      searchinput: true
    })
  },
  searchclose: function(){
    this.setData({
      search: true,
      searchinput: false
    })
  },
  onLoad: function () {
    wx.showLoading();
    var that = this;
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    wx.getSystemInfo({
      success: function (res) {
        if (res.model.search('iPhone X') != -1) {
          that.setData({
            iphone: "iphoneTop",
            iponesc: "iphonesearch"
          });
        }
      }
    })
    this.initCategory();
  },
  initCategory: function () {
    var that = this
    wx.request({
      url: app.globalData.urls + '/general/base/wxmenu',  // '/shop/goods/category/all',
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          var categories = res.data.data.categories;
          var categorieslist = res.data.data.categorieslist;
          var banners = res.data.data.banners
          wx.hideLoading();
          that.setData({
            categories: categories,
            categoriesListAll: categorieslist,
            categorieslist: categorieslist,
            banners: banners,
            activeCategoryId: 0
          });
        }
        app.saveReponseHeader(res);
      }
    })
  },
  getGoodsList: function (categoryId) {
    var that = this;
    var categorieslist = [];
    var categoriesListAll = that.data.categoriesListAll
    if (categoryId == 0) {
      that.setData({
        categorieslist: categoriesListAll,
      });
      return
    }
    for (var x in categoriesListAll) {
      var category = categoriesListAll[x]
      var pid = category.pid
      if (pid == categoryId) {
        categorieslist.push(category);
      }
    }
    that.setData({
      categorieslist: categorieslist,
    });

  },
  toDetailsTap: function (e){
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
    this.setData({
      search: true,
      searchinput: false
    })
  },
  onShow: function () {
    var that = this;
  },

})