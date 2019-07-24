// pages/order/done/done.js

var app = getApp();

const activityService = require('/../../services/activity-service')
const userService = require('/../../services/user-service')
const _ = require('../../utils/lodash')

Page({
  data: {
    userInfo:{},
    participants:[],
    onlyUnattended:false,
    searchByName:undefined
  },
  onLoad: function (options) {
    const pages = getCurrentPages();
    this.detailPage = pages[pages.length-2];
    if(!this.detailPage.data.activity || !this.detailPage.data.activity.participants){
      wx.showToast({
        title: '无法获取已报名列表',
        icon: 'none'
      })
      return;
    }

    if(app.globalData.userInfo){
      this.initPage();
    }else{
      event.on('setUserInfo',this,function(){
        this.initPage();
      }.bind(this));  
    }

    this.setData({
      participants:this.detailPage.data.activity.participants
    });

  },
  onShow: function () {
  },
  initPage:function(){
    this.setData({
      isAdmin:userService.isAdmin(),
      userInfo:app.globalData.userInfo,
      canSubmit:true
    });
  },
  signout: function(e){
    
    const desc = e.target.dataset.desc;
    const id = e.target.id;
    wx.showModal({
      title: '确定'+desc,
      success:function(res){
        if(res.confirm){

          wx.showLoading({
            title:'正在'+desc
          });

          activityService.signout(id).then(function(){
            wx.showToast({
              icon:'none',
              title:desc+'成功'
            });
            wx.hideLoading();

            this.data.participants.forEach(function(v,index){

              if(v._id==id){
                this.data.participants.splice(index,1);
                return true;
              }
            }.bind(this));

            this.detailPage.data.activity.participants = this.data.participants;

            this.detailPage.setData({
              activity:this.detailPage.data.activity
            });

            wx.navigateBack({
              delta: 1
            })

          }.bind(this)).catch(function(err){ 

            console.info(err)

            wx.showToast({
              icon:'none',
              title:desc+'失败'
            });
            wx.hideLoading();
          })
        }
      }.bind(this)
    })
  },
  setAttendance:function(e){
    const id = e.target.id;
  
    const target = _.find(this.data.participants,function(o){
      return o._id === id;
    });
    target.isAttended=true;
    

    activityService.updateSignup({
      _id:id,
      isAttended:target.isAttended
    }).then(function(res){
      this.setData({
        participants:this.data.participants
      });
      wx.showToast({
        icon:'none',
        title:res.message
      })
    }.bind(this)).
    catch(function(res){
      wx.showToast({
        icon:'none',
        title:res.message
      })
    }.bind(this));
  },
  onlyUnattended:function(e){
    this.setData({
      onlyUnattended:e.detail.value.length>0
    });
  },
  searchByNameChange:function(e){
    this.setData({
      searchByName:e.detail.value
    });
  },
  exportToClicpboard:function(e){
    let data = this.data.participants.reduce(function(result,p){
        return result+=p.name+','+(p.gender==1?'男':'女')+','+p.age+','+p.mobile+','+
        p.job+','+
        p.nationalId+','+
        _.find(userService.getTypes(),function(o){
          return o.value==p.politicalStatus
        }).text+','+
        p.liveCommittee+','+
        p.address+'\n';
    },'姓名,性别,年龄,电话,职业,身份证号,政治面貌,所属居委会,个人地址\n');

    wx.setClipboardData({
      'data':data,
      'success':function(){
        wx.hideLoading();
        wx.showToast({
          icon:'none',
          title:'成功导出用户列表到粘贴板'
        })
      }
    })
  }
})