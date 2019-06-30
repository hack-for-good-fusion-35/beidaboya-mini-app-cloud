// pages/order/done/done.js

var app = getApp();

Page({
  data: {
    groupInfo: {},
    pinsucess: false
  },
  onLoad: function (options) {
    this.uid = wx.getStorageSync('uid');
    this.order_sn = options.order_sn;
    if (options.pinsucess !== undefined) {
      this.setData({ pinsucess: true })
    }
    // this.openGroupSuccess();
  },
  onHide: function () {
    clearInterval(this.timer);
  },
  onUnload: function () {
    clearInterval(this.timer);
  },
  onShow: function () {
    // var page = this;
    // var data = wx.getStorageSync('groupInfo');
    // var timer = setInterval(function(){
    // var time = page.timeFormat(data.group.group_off_time * 1000);
    //   data.group.group_end_time = time;
    //   if(!time){
    //     page.setData({
    //       groupInfo:data
    //     })
    //     return ;
    //   }
    //   page.setData({
    //     groupInfo:data
    //   })
    // },1000)  
    // this.timer = timer;
    this.openGroupSuccess()
  },
  openGroupSuccess: function () {
    
  },
  timeFormat: function (timestamp) {
    var page = this;
    var timestamp = timestamp;
    // setInterval(function(){
    var currentTime = (new Date()).getTime();
    var time = timestamp - currentTime;
    if (time <= 0) return false;
    var times = Math.floor(time / (1000 * 60 * 60)) + ':' + Math.floor(time / (1000 * 60) % 60) + ':' + Math.floor(time / 1000 % 60);
    return times;
    // },1000)

  },
  backHome: function (e) {
    app.backHome();
  }
})