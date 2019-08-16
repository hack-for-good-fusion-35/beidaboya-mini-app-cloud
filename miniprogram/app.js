//app.js

const event = require('./utils/event')

App({
  login(){

    wx.showLoading({
      title: '正在登陆',
      mask: true
    });

    wx.login({
      success: function(res) {
        this.globalData.code=res.code
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.cloud.callFunction({
          name: 'login',
          data: {}, 
          success: res => {
            console.log('[云函数] [login] user openid: ', res.result.openid)
            this.globalData.openid = res.result.openid
            wx.hideLoading();
            this.globalData.logined = true;
            event.emit('login',true);
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
            event.emit('login',false);
          }
        })   
      }.bind(this)
    });
  },
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    this.login();
  },
  globalData: {
    logined:false,
    openid:'',
    userInfo: null,
  }
})