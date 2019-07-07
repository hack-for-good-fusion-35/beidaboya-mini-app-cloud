const app = getApp()
const activityService = require('/../../services/activity-service')
const userService = require('/../../services/user-service')
var event = require('../../utils/event')

var pageConfig = {
  data: {
    head: {
    },
    condition:null,
    indexData: {
      activities:[]
    },
    counts: 10,
    start: 0,
    runOutOfData:false
  },
  onLoad: function() {
    this.data.runOutOfData=false;
    if(app.globalData.userInfo){
      this.initPage();
    }else{
      event.on('setUserInfo',this,function(){
        this.initPage();
      }.bind(this));  
    } 
  },
  initPage:function(){
    this.setData({
      isAdmin:userService.isAdmin()
    });
    this.loadActivities();
  },
  loadActivities:function(){
    activityService.find(this.data.condition,this.data.start, this.data.counts).then(function(response) {
      if(response.length<1||response.length<this.data.counts){
        this.setData({
          runOutOfData:true
        });
      }
      let newList = this.data.indexData.activities.concat(response)
      this.setData({
        'indexData.activities': newList,
        start: this.data.start + this.data.counts
      })
    }.bind(this));
  },
  onShow: function() {

  },
  onReachBottom: function() {
    if(!this.data.runOutOfData){
      this.loadActivities();
    } 
  }
}

Page(pageConfig)

module.exports = pageConfig;