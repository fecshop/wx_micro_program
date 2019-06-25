// 文档出处： 
// https://upupming.site/2018/07/23/mini-program-i18n/#%E5%85%B6%E4%BB%96%E9%A1%B5%E9%9D%A2%E7%9A%84%E5%A4%84%E7%90%86
let T = {
  locale: null,
  langIndex: null,
  locales: {},
  langCodes: ['zh', 'en'],   // 可用的语言包
  langNames: ['简体中文', 'English']  // 需要和上面的配置对应
}

let lastLangIndex;

T.registerLocale = function (locales) {
  T.locales = locales;
}

T.setLocaleByCode = function (setCode) {
  //T.locale = code;
  var langCodes = T.langCodes
  for (var x in langCodes) {
    var code = langCodes[x];
    if (code == setCode) {
      //T.locale = code;
      T.langIndex = x;
      T.setLocaleByIndex(x);
    }
  }
}


T.setLocale = function (code) {
  T.locale = code;
}

T.getLangIndexByCode = function (langCode) {
  var langCodes = T.langCodes
  for (var x in langCodes ) {
    var code = langCodes[x];
    if (code == langCode) {
      console.log(x)
      return x
    }
  }
}

T.getCodeByIndex = function (index) {
  return T.langCodes[index];
}






T.getLangNames = function () {
  return T.langNames;
}





T.setLocaleByIndex = function (index) {
  lastLangIndex = index;
  T.setLocale(T.langCodes[index]);

  //setNavigationBarTitle(index);
  setTabBarLang(index);
}


T.getLanguage = function () {
  setNavigationBarTitle(lastLangIndex);
  return T.locales[T.locale];
}


let navigationBarTitles = [
  '哈工大博物馆小助手',
  'HIT Museum Assistant'
];
// 设置导航栏标题
function setNavigationBarTitle(index) {
  wx.setNavigationBarTitle({
    title: navigationBarTitles[index]
  })
}

// 页面底部toolbar
let tabBarLangs = [
  [
    '首页',
    '分类',
    '购物车',
    '我的'
  ],
  [
    'Home',
    'Category',
    'Cart',
    'My'
  ]
];
// 设置 TabBar 语言
function setTabBarLang(index) {
  let tabBarLang = tabBarLangs[index];

  tabBarLang.forEach((element, index) => {
    wx.setTabBarItem({
      'index': index,
      'text': element
    })
  })
}












export default T