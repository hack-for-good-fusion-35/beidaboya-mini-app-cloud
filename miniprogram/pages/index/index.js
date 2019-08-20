const app = getApp()
const userService = require('../../services/user-service')
const activityService = require('../../services/activity-service')
const event = require('../../utils/event')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo : true,
    activityTypes: activityService.getTypes()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取用户信息
    if(app.globalData.logined){
      this.getUserInfo();
    }

    event.on('login',this,function(logined){
      if(logined){
        this.getUserInfo();
      }
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
          this.setData({
            userInfo:false
          });
        }
      },
      fail: function(err){
        wx.hideLoading();
        this.setData({
          userInfo:false
        });
      }
    }); 
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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
    if (e.detail.userInfo) {   
      this.getUserInfoDetail(e.detail.userInfo);
    }
  },
  
  getUserInfoDetail(userInfo){
    return userService.setUserInfo(userInfo).then(function(userInfo){
      this.setData({
        userInfo:app.globalData.userInfo
      });
    }.bind(this)).
    catch(function(err){
      this.reLogin();
    }.bind(this));
  }
})