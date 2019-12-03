//app.js
App({
  globalData: {
    //用户ID
    userId: '',
    //用户信息
    userInfo: null,
    //授权状态
    auth: {
      'scope.userInfo': false
    },
    //登录状态
    logged: false
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'test-ax5jl',
        traceUser: true
      });
    }
  }
})