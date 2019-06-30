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
   activityService.getById(id).then(function(response){
   response.statusText=_.find(activityService.getTypes(),function(o){
    return o.value=response.status;
   }).text;

   this.setData({
      activity: response
    })
   }.bind(this))   
  },
  flex: function () {
    this.setData({
      flexed: !this.data.flexed
    })
  }
})