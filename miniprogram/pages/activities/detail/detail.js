const app = getApp()
const activityService = require('/../../../services/activity-service.js')
const _ = require('../../../utils/lodash')

Page({
  data: {
    activity: {},
    flexed: false
  },
 
  onLoad: function (param) {
  var id=param._id;

   wx.showLoading({
    title: '正在加载活动内容',
    mask: true
  });

   activityService.getById(id).then(function(response){

   response.statusText=_.find(activityService.getStatus(),function(o){
    return o.value==response.status;
   }).text;

   response.typeText = _.find(activityService.getTypes(),function(o){
    return o.value==response.type;
   }).text;

   this.setData({
      activity: response
    })
    wx.hideLoading();
   }.bind(this)).
   then(function(){
    return activityService.findParticipants({
      activityId:id
    }).then(function(participants){
      this.data.activity.participants = participants
      this.setData({
        activity:this.data.activity
      })
    }.bind(this)); 
   }.bind(this))   
  },
  imgPreview:function(event){
    var src = event.currentTarget.dataset.src;//获取data-src
    var imgList = event.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: imgList // 需要预览的图片http链接列表
    })
  },
  flex: function () {
    this.setData({
      flexed: !this.data.flexed
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: "北达博雅金花社区小程序首页",
      path: "pages/activities/activities"
    }
  }
})