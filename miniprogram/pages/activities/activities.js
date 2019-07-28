const app = getApp()
const activityService = require('/../../services/activity-service')
const userService = require('/../../services/user-service')
var event = require('../../utils/event')
const util = require('../../utils/util')

const formFields = [{
  name:'title',
  description:'活动名称',
  validates:['not-empty']
},
{
  name:'startDate',
  type:'date',
  text:'请选择开始日期',
  description:'开始日期'
},
{
  name:'endDate',
  type:'date',
  text:'请选择结束日期',
  description:'结束日期'
},
{
  name:'type',
  type:'picker',
  values: activityService.getTypes(),
  text:'请选择活动类型',
  description:'活动类型'
},
{
  name:'status',
  type:'picker',
  values:activityService.getStatus(),
  text:'请选择活动状态',
  description:'活动状态'
}];


var pageConfig = {
  data: {
    formFields:formFields,
    collapsed:true,
    form:{

    },
    indexData: {
      activities:[]
    },
    counts: 10,
    start: 0,
    runOutOfData:false
  },
  onLoad: function(params) {

    this.start=0;
    this.data.form = {};

    this.data.form.search = params.search;
    this.data.form.type = params.type;

    util.initForm(this,this.data.form,formFields);

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

    activityService.find(this.data.form,this.data.start, this.data.counts,this.data.isAdmin).then(function(response) {
      
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
      }.bind(this)).
    catch(function(err){
      wx.showToast({
        title: err,
        icon: 'none'
      })
    });
  },
  onShow: function() {

  },
  onReachBottom: function() {
    if(!this.data.runOutOfData){
      this.loadActivities();
    } 
  },
  toggleSearchBar:function(){
    this.setData({
      collapsed:!this.data.collapsed
    });
  },
  search:function(){
    this.data.indexData.activities = [];
    this.setData({
      indexData:this.data.indexData,
      start:0,
      collapsed:true
    });
    this.loadActivities();
  }
}

Page(pageConfig)

module.exports = pageConfig;