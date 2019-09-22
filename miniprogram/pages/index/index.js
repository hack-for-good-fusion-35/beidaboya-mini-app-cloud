const app = getApp()
const activityService = require('../../services/activity-service')
const event = require('../../utils/event')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo : app.globalData.userInfo,
    activityTypes: activityService.getTypes()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    event.on('getUserInfo',this,function(userInfo){
      this.setData({
        userInfo: userInfo
      });
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "北达博雅金花社区小程序首页",
      path: "pages/index/index"
    }
  },

  onGetUserInfo: function (e) {
    return app.onGetUserInfo(e);
  },

  refuceGetUserInfo: function(e){
    return app.refuceGetUserInfo(e);
  }
})