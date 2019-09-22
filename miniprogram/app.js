//app.js

const event = require('./utils/event')
const userService = require('./services/user-service')

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
            this.getUserInfo();
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
            event.emit('login',false);
          }
        })   
      }.bind(this)
    });
  },

  getUserInfo:function(){
    wx.showLoading({
      title: '正在获取用户信息',
      mask: true
    });

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: function(res){
              // 可以将 res 发送给后台解码出 unionId
              this.getUserInfoDetail(res.userInfo).
              then(function(){
                wx.hideLoading();
              });
            }.bind(this),
            fail: function(err){
              this.reLogin();
            }.bind(this)
          });
        }else{
          wx.hideLoading();
          this.globalData.userInfo=false;
          event.emit('getUserInfo',false);
        }
      },
      fail: function(err){
        wx.hideLoading();
        this.globalData.userInfo=false;
        event.emit('getUserInfo',false);
      }
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
    userInfo: true,
  },
  getUserInfoDetail(userInfo){
    return userService.setUserInfo(userInfo,this).then(function(userInfo){
      event.emit('getUserInfo',userInfo);
    }.bind(this)).
    catch(function(err){
      this.reLogin();
    }.bind(this));
  },
  reLogin:function(){
    wx.hideLoading();
    wx.showModal({
      title: '登陆失败',
      content: '请点击确定重新登陆',
      showCancel:false,
      success:function(res) {
        if (res.confirm) {
          this.getUserInfo();
        }
      }.bind(this)
    });       
  },
  onGetUserInfo: function (e) {
    if (e.detail.userInfo) {   
      this.getUserInfoDetail(e.detail.userInfo);
    }
  },
  refuceGetUserInfo: function(e){
    wx.showModal({
      title: '是否拒绝授权?',
      content: '请注意拒绝授权将无法使用所有功能',
      success: function (res) {
        if (res.confirm) {
          event.emit('getUserInfo',{});
        }
      }.bind(this)
    })
  }
})