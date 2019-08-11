const app = getApp()
const userService = require('../../services/user-service')
const activityService = require('../../services/activity-service')

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
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框

          wx.showLoading({
            title: '正在获取用户信息',
            mask: true
          });
          
          this.getUserInfo();
        }else{
          //userInfo if fale, will show the modal
          this.setData({
            userInfo:false
          });
        }
      },
      fail: function(res){
        this.setData({
          userInfo:false
        });
      }.bind(this)
    })
  },

  getUserInfo:function(){
    wx.getUserInfo({
      success: function(res){
        // 可以将 res 发送给后台解码出 unionId
        this.login(res.userInfo).
        then(function(){
          wx.hideLoading();
        });
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (app.userInfoReadyCallback) {
          app.userInfoReadyCallback(res)
        }
      }.bind(this),
      fail: function(err){
        this.reLogin();
      }.bind(this)
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

  },

  onGetUserInfo: function (e) {
    if (!app.globalData.userInfo && e.detail.userInfo) {   
      this.login(e.detail.userInfo);
    }
  },
  
  login(userInfo){
    return userService.setUserInfo(userInfo).then(function(){
      this.setData({
        userInfo:app.globalData.userInfo
      });
    }.bind(this)).
    catch(function(){
      this.reLogin();
    }.bind(this));
  }
})