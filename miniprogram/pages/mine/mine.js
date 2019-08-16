//index.js
//获取应用实例
const app = getApp()
const userService = require('/../../services/user-service')
const event = require('/../../utils/event')

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        isAdmin:userService.isAdmin(),
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } 

    event.on('setUserInfo',this,function(userInfo){
      this.setData({
        isAdmin:userService.isAdmin(),
        userInfo:app.globalData.userInfo,
        hasUserInfo:true
      });
    }.bind(this));

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  myActivities: function (e) {
    wx.navigateTo({
      url: '/pages/activities/activities?search=singed'
    });
  },
  historyActivities: function (e) {
    wx.navigateTo({
      url: '/pages/activities/activities?search=ended'
    });
  },
  adminList: function (e) {
    wx.navigateTo({
      url: '/pages/admin-list/admin-list'
    });
  },
})
