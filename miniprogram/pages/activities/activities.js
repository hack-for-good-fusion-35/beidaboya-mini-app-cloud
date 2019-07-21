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
  values:[
    {value:1,text:'预览'},
    {value:4,text:'报名中'},
    {value:5,text:'进行中'},
    {value:10,text:'结束'},
    {value:13,text:'取消'}
  ],
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


    activityService.find(this.data.form,this.data.start, this.data.counts).then(function(response) {
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
  },
  toggleSearchBar:function(){
    this.setData({
      collapsed:!this.data.collapsed
    });
  },
  search:function(){
    
  }
}

Page(pageConfig)

module.exports = pageConfig;