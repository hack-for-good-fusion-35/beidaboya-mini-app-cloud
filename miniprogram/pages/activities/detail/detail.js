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
    title: '正在加载活动内容'
  })

   activityService.getById(id).then(function(response){
  
   response.statusText=_.find(activityService.getTypes(),function(o){
    return o.value=response.status;
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

  flex: function () {
    this.setData({
      flexed: !this.data.flexed
    })
  }
})