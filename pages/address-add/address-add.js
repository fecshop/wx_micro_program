var commonCityData = require('../../utils/city.js')
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
    provinces: [],
    citys: [],
    stateArr: [],
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0
  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function (e) {
    var that = this;
    var linkMan = e.detail.value.linkMan;
    var address = e.detail.value.address;
    var mobile = e.detail.value.mobile;
    var code = e.detail.value.code;

    if (linkMan == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
    if (mobile == "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    }
    if (this.data.selProvince == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    if (this.data.selCity == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel: false
      })
      return
    }
    var cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
    var cityName = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].name;
    var districtId;
    var areaStr;
    if (this.data.selDistrict == "请选择" || !this.data.selDistrict) {
      districtId = '';
      areaStr = '';
    } else {
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
      areaStr = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].name;
    }
    if (address == "") {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel: false
      })
      return
    }
    if (code == "") {
      wx.showModal({
        title: '提示',
        content: '请填写邮编',
        showCancel: false
      })
      return
    }
    var apiAddoRuPDATE = "add";
    var apiAddid = that.data.id;
    if (apiAddid) {
      apiAddoRuPDATE = "update";
    } else {
      apiAddid = 0;
    }
    
    
    var stateCode = that.getStateCode()
    wx.request({
      url: app.globalData.urls + '/customer/address/save',
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        address_id: apiAddid,
        first_name: linkMan,
        last_name: '',
        // email
        telephone: mobile,
        addressCountry: 'CN',
        addressState: stateCode,
        city: cityName,
        area: areaStr,
        street1: address,
        zip: code,
        isDefaultActive: 1,
        /*
        provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
        cityId: cityId,
        districtId: districtId,
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: 'true'
        */
      },
      success: function (res) {
        if (res.data.code != 200) {
          // 登录错误 
          wx.hideLoading();
          wx.showModal({
            title: '失败',
            content: '保存地址失败',
            showCancel: false
          })
          return;
        }
        app.saveReponseHeader(res);
        // 跳转到结算页面
        wx.navigateBack({})
      }
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
    //this.initShippingAddress()
  },

  getStateCode: function() {
    var stateName = commonCityData.cityData[this.data.selProvinceIndex].name;
    var stateArr = this.data.stateArr;
    if (stateArr) {
      for (var x in stateArr) {
        var stateArrName = stateArr[x];
        if (stateArrName == stateName) {
          return x;
        }
      }
    }
    return stateName;
  },
  initCityData: function (level, obj) {
    if (level == 1) {
      var pinkArray = [];
      for (var i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name);
      }
      this.setData({
        provinces: pinkArray
      });
    } else if (level == 2) {
      var pinkArray = [];
      var dataArray = obj.cityList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        citys: pinkArray
      });
    } else if (level == 3) {
      var pinkArray = [];
      var dataArray = obj.districtList
      for (var i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name);
      }
      this.setData({
        districts: pinkArray
      });
    }

  },
  bindPickerProvinceChange: function (event) {
    var selIterm = commonCityData.cityData[event.detail.value];
    this.setData({
      selProvince: selIterm.name,
      selProvinceIndex: event.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(2, selIterm)
  },
  bindPickerCityChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: selIterm.name,
      selCityIndex: event.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selIterm)
  },
  bindPickerChange: function (event) {
    var selIterm = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    if (selIterm && selIterm.name && event.detail.value) {
      this.setData({
        selDistrict: selIterm.name,
        selDistrictIndex: event.detail.value
      })
    }
  },
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.setLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    that.initAddressInfo(e)
    
  },

  initAddressInfo: function (e){
    var that = this
    this.initCityData(1);
    var id = e.id;
    if (id) {
      // 初始化原数据
      wx.showLoading();
      wx.request({
        url: app.globalData.urls + '/customer/address/edit',
        header: app.getRequestHeader(),
        data: {
          address_id: id
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 200) {
            var address = res.data.data.address
            var addressData = {
              address: address.street1,
              code: address.zip,
              id: address.address_id,
              linkMan: address.first_name + address.last_name,
              mobile: address.telephone,
              provinceStr: address.stateStr,
              cityStr: address.city,
              areaStr: address.area,
            }
            that.setData({
              id: id,
              stateArr: address.stateArr,
              addressData: addressData,
              selProvince: addressData.provinceStr,
              selCity: addressData.cityStr,
              selDistrict: addressData.areaStr,
            });
            // 设置数据/
            let provinceName = addressData.provinceStr;
            let cityName = addressData.cityStr;
            let diatrictName = addressData.areaStr;
            let retSelIdx = 0;

            for (var i = 0; i < commonCityData.cityData.length; i++) {
              if (provinceName == commonCityData.cityData[i].name) {
                let eventJ = { detail: { value: i } };
                that.bindPickerProvinceChange(eventJ);
                that.data.selProvinceIndex = i;
                for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
                  if (cityName == commonCityData.cityData[i].cityList[j].name) {
                    //that.data.selCityIndex = j;
                    eventJ = { detail: { value: j } };
                    that.bindPickerCityChange(eventJ);
                    for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                      if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                        //that.data.selDistrictIndex = k;
                        eventJ = { detail: { value: k } };
                        that.bindPickerChange(eventJ);
                      }
                    }
                  }
                }
              }
            }
            //that.setDBSaveAddressId(addressData);
            return;
          } else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据',
              showCancel: false
            })
          }
          app.saveReponseHeader(res);
        }
      })
    }
  },

  /*
  setDBSaveAddressId: function (data) {
    console.log(data.provinceStr);
    console.log(data.cityStr);
    console.log(data.areaStr);
    var retSelIdx = 0;
    for (var i = 0; i < commonCityData.cityData.length; i++) {
      if (data.provinceStr == commonCityData.cityData[i].name) {
        console.log(i)
        this.data.selProvinceIndex = i;
        for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
          if (data.cityStr == commonCityData.cityData[i].cityList[j].name) {
            this.data.selCityIndex = j;
            for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
              if (data.areaStr == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                this.data.selDistrictIndex = k;
              }
            }
          }
        }
      }
    }
  },
  */
  selectCity: function () {

  },
  deleteAddress: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.urls + '/customer/address/remove',
            //url: app.siteInfo.url + app.siteInfo.subDomain + '/user/shipping-address/delete',
            header: app.getPostRequestHeader(),
            data: {
              address_id: id
            },
            success: (res) => {
              if (res.data.code == 200) {
                wx.navigateBack({})
              }
              app.saveReponseHeader(res);
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  readFromWx: function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        let provinceName = res.provinceName;
        let cityName = res.cityName;
        let diatrictName = res.countyName;
        let retSelIdx = 0;

        for (var i = 0; i < commonCityData.cityData.length; i++) {
          if (provinceName == commonCityData.cityData[i].name) {
            let eventJ = { detail: { value: i } };
            that.bindPickerProvinceChange(eventJ);
            that.data.selProvinceIndex = i;
            for (var j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
              if (cityName == commonCityData.cityData[i].cityList[j].name) {
                //that.data.selCityIndex = j;
                eventJ = { detail: { value: j } };
                that.bindPickerCityChange(eventJ);
                for (var k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                  if (diatrictName == commonCityData.cityData[i].cityList[j].districtList[k].name) {
                    //that.data.selDistrictIndex = k;
                    eventJ = { detail: { value: k } };
                    that.bindPickerChange(eventJ);
                  }
                }
              }
            }

          }
        }

        that.setData({
          wxaddress: res,
        });
      }
    })
  }
})