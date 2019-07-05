// pages/search/search.js
const app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		search: true,
    searchs: [],
		noneHidden: true,
		searchHidden: true,
    isLoadProduct: false,
		recentSearch: [],
		searchValue: '',
    page: 0,
    //语言 - begin
    language: '',
    categoryId: '',
    //语言 - end
	},
	getRecentSearch: function() {
		let recentSearch = wx.getStorageSync('recentSearch');
		this.setData({
			recentSearch
		});
	},
	clearHistory:function(){
		wx.clearStorageSync('recentSearch')
		this.setData({
			recentSearch:[]
		})
	},
	goSearch:function(e){
    this.setData({
      searchE:e
    });
		this.search(e)
	},
  setLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
  },
  changeLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    this.search()
  },
	search: function(e) {
    if (!e) {
      var e = this.data.searchE
    }
		let that = this
		let keywords;
    that.setData({
      searchs: [],
      page: 0,
    });
		e.detail.value? keywords= e.detail.value: keywords = e.currentTarget.dataset.text,
		that.data.searchValue = keywords;
		if (that.data.searchValue) {
			// 记录最近搜索
			let recentSearch = wx.getStorageSync('recentSearch') || [];
			if(!app.isStrInArray(keywords,recentSearch)){
				recentSearch.unshift(that.data.searchValue);
				wx.setStorageSync('recentSearch', recentSearch)
				that.setData({
					recentSearch:recentSearch
				})
			}
		}
    that.searchProduct()
	},
  searchProduct: function() {
    var that = this
    that.setData({
      page: that.data.page + 1
    });
    wx.request({
      url: app.globalData.urls + '/catalogsearch/index/wxindex',
      data: {
        q: that.data.searchValue,
        p: that.data.page
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200 && res.data.data.products.length > 0) {
          var searchs = that.data.searchs;
          for (var i = 0; i < res.data.data.products.length; i++) {
            searchs.push(res.data.data.products[i]);
          }
          that.setData({
            searchs: searchs,
            searchHidden: false,
            noneHidden: true
          });
          that.setData({
            isLoadProduct: false,
          });
        } else {
          that.setData({
            searchHidden: false,
            noneHidden: false
          });
        }
        app.saveReponseHeader(res);
        
      }
    })
  },
  loadProduct: function () {
    console.log("eeeeee")
    var that = this
    if (that.data.isLoadProduct == false) {
      that.setData({
        isLoadProduct: true,
      });
      that.searchProduct()
    }
  },
	searchFocus: function() {
		this.setData({
			search: false,
			searchInput: true
		})
	},
	searchClose: function() {
		// this.getRecentSearch()
		this.setData({
			search: true,
			searchInput: false,
			searchHidden:true
		})
	},
	toDetailTap:function(e){
		wx.navigateTo({
			url:"/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		this.getRecentSearch();
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {

	}
})
