const app = getApp();
const util = require('/../../utils/util')
const _ = require('/../../utils/lodash')
const activityService = require('/../../services/activity-service')
const userService = require('/../../services/user-service')

const formFields = [{
  name:'name',
  description:'报名人姓名',
  validates:['not-empty']
},{
  name:'gender',
  type:'picker',
  values:[
    {value:1,text:'男'},
    {value:2,text:'女'}
  ],
  text:'请选择报名人性别',
  description:'报名人性别',
  validates:['not-empty']
},{
  name:'age',
  description:'报名人年龄',
  validates:['not-empty']
},{
  name:'mobile',
  description:'报名人电话',
  validates:['not-empty','phone']
},{
  name:'job',
  description:'报名人职业',
  validates:['not-empty']
},{
  name:'nationalId',
  description:'报名人身份证号',
  validates:['not-empty','nationalId']
},{
  name:'politicalStatus',
  type:'picker',
  values:[
    {value:13,text:'群众（普通居民）'},
    {value:1,text:'中共党员'},
    {value:2,text:'中共预备党员'},
    {value:3,text:'共青团员'},
    {value:4,text:'民革党员'},
    {value:5,text:'民盟盟员'},
    {value:6,text:'民建会员'},
    {value:7,text:'民进会员'},
    {value:8,text:'农工党党员'},
    {value:9,text:'致公党党员'},
    {value:10,text:'九三学社社员'},
    {value:11,text:'台盟盟员'},
    {value:12,text:'无党派人士'} 
  ],
  text:'请选择报名人政治面貌',
  description:'报名人政治面貌',
  validates:['not-empty']
},{
  name:'liveCommittee',
  description:'报名人所属社区居委会',
  validates:['not-empty']
},{
  name:'address',
  description:'报名人个人地址',
  validates:['not-empty']
}]

Page({
  data: {
    activityId:'',
    formFields:formFields,
    loading: true,
    canSubmit:true
  },
  onLoad(params) {
    var participant = _.clone(app.globalData.userInfo);

    util.initForm(this,participant,formFields);
  
    this.setData({
      form:participant,
      formFields:formFields,
      activityId: params.id
    });       

    if(!this.data.activityId){
      wx.showToast({
        icon:'none',
        title: '无法获取活动ID'
      });
    }
  },
  submitBtn() {  
    var participant = this.data.form;
    participant.isAttended=false;
    try{
      util.validateForm(participant,formFields);
    }catch(message){
      wx.showToast({
        icon:'none',
        title: message
      });
      return;
    }

    if(!participant._id){
      wx.showToast({
        icon:'none',
        title: '没有读取到用户'
      });
      return;
    }
  
    this.setData({
      canSubmit:false
    })

    activityService.signup(this.data.activityId,participant).then(function(response){
        if (response.success){
          wx.showToast({
            icon:'none',
            title: '报名成功'
          });

          setTimeout(function(){
            let pages = getCurrentPages();

            let prevPage = pages[ pages.length - 2 ];

            if(prevPage.data.activity&&prevPage.data.activity.participants){
              prevPage.data.activity.participants.push(participant);
              prevPage.setData({ 
                id:this.data.activityId,
                activity : prevPage.data.activity
              });
            }
            
            wx.navigateBack({
              delta: 1
            })
          }.bind(this),1000)
          
          return participant;
        }else{
          wx.showToast({
            icon:'none',
            title: '报名失败'+(err.message?',原因：'+err.message:'')
          });

          this.setData({
            canSubmit:true
          });
        }
    }.bind(this)).catch(function(err){
      wx.showToast({
        icon:'none',
        title: '报名失败'+(err.message?',原因：'+err.message:'')
      });
      this.setData({
        canSubmit:true
      });
    }.bind(this)).then(function(participant){
      userService.updateIfDiff(participant);
      return participant;
    });


  },
  bindPickerChange(e) {
    this.setData({
      index: e.detail.value
    });
  }
});