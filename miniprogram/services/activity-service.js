const lodash = require('../utils/lodash')
const app = getApp()

class ActivityService {
  constructor() {

    this.STATUS_PREVIEW = 1;
    this.STATUS_SIGNUPING = 4;
    this.STATUS_ONGOING = 7;
    this.STATUS_ENDED = 10;
    this.STATUS_CANCELED = 13;

    this.types = [
      {
        value: "1",
        text: "党建引领服务",
        covers_image: "../../static/images/danghui.png"
      },
      {
        value: "2",
        text: "社区环境提升服务",
        covers_image: "../../static/images/shequ.jpeg"
      },
      {
        value: "3",
        text: "家庭服务",
        covers_image: "../../static/images/jiating.png"
      },
      {
        value: "4",
        text: "长者服务",
        covers_image: "../../static/images/zhangzhe.jpeg"
      },
      {
        value: "5",
        text: "青少年服务",
        covers_image: "../../static/images/qingshaonian.jpeg"
      },
      {
        value: "6",
        text: "社区志愿服务",
        covers_image: "../../static/images/zhiyuanzhe.jpeg"
      }
    ];

    this.status = [
      {value:this.STATUS_PREVIEW,text:'预览'},
      {value:this.STATUS_SIGNUPING,text:'报名中'},
      {value:this.STATUS_ONGOING,text:'进行中'},
      {value:this.STATUS_ENDED,text:'结束'},
      {value:this.STATUS_CANCELED,text:'取消'}
    ];

    // this.mockData = [{
    //   _id: 1,
    //   type:1,
    //   status:4,
    //   title: '义务清理街道',
    //   numberLimit:99,
    //   description:'清理好多好多垃圾',
    //   participants:[],
    //   address:'在遥远的地方',
    //   startDate: '2019-01-02',
    //   endDate: '2019-01-13',
    //   images: ['/static/images/img'+Math.round(Math.random()*3)+'.jpg','/static/images/img'+Math.round(Math.random()*3)+'.jpg'],
    // }]
  }

  find(condition,start,count,searchAll) {

    condition = lodash.clone(condition);

    return new Promise(function(resolve,reject){
      this.preFind(condition,start,count,searchAll).
          then(function(ids){

            const db = wx.cloud.database();
            let search = db.collection('activities');

            const command = db.command;

            if(condition.title){
              condition.title = db.RegExp({
                regexp: condition.title,
                options: 'i',
              })
            }

            switch(condition.search){
              case 'singed':condition.status = command.lt(this.STATUS_ENDED);break;
              case 'ended':condition.status = command.gte(this.STATUS_ENDED);break;
              case 'published':
                condition.status = command.lt(this.STATUS_ENDED);
                search=search.orderBy('startDate','desc');
              break;
            }

            condition.search = undefined;

            if(condition.startDate){
              condition.startDate = command.gte(condition.startDate);
            }

            if(condition.endDate){
              condition.endDate = command.lte(condition.endDate);
            }
            
            search=condition?search.where(condition):search;
            search=start?search.skip(start):search;
            search=count?search.limit(count):search;
            search=searchAll?search.orderBy('updateDate','desc'):search;

            if(ids&&ids.length>0){
              condition._id = command.in(ids);
            }
          
            return search.get({
              success: function(res){
                  resolve(res.data);
              }.bind(this),
              fail: err => {
                console.error('[数据库] [查询记录] 失败：', err);
                reject(err);
              }
            });

          }.bind(this)).
          catch(function(err){
            reject(err);
          });
    }.bind(this));

  }

  preFind(condition,start,count,searchAll){
    return new Promise(function(resolve,reject){

      const preCondition = {};

      if(app.globalData.userInfo&&app.globalData.userInfo._id){
        preCondition.userId = app.globalData.userInfo._id;
      }else{
        reject('用户信息还没加载，无法进行互动查询');
      }

      const db = wx.cloud.database();

      let search = db.collection('signup_records').field({
        activityId:true
      });

      const command = db.command;

      search=search.where(preCondition);

      if(searchAll || (condition.search!='singed'&&condition.search!='ended')) {
        resolve([]);
        return;
      }

      return search.get({
        success: function(res){
          const ids=[];
          res.data.reduce(function(result,item){
            result.push(item.activityId);
            return result;
          },ids);
          resolve(ids);
        }.bind(this),
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err);
          reject(err);
        }
      });

    });
  }

  getById(id) {
    return this.find({
      _id:id
    }).then(function(activities){
        if(activities.length==1){
          return activities[0];
        }else if(activities.length<1){
          throw {
            status:0,
            message:'无法找到记录'
          }
        }else{
          throw {
            status:2,
            message:'有多于一条记录'
          }
        }
    });
  }

  findParticipants(condition){
    return new Promise(function (resolve,reject) {
      const db = wx.cloud.database()
      let search = db.collection('signup_records');
      return search.where(condition).get({
        success: function(res){
            resolve(res.data);
        }.bind(this),
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err);
          reject(err);
        }
      })
    }.bind(this))
  }

  save(activity){
    activity.updateDate = Date.now();
    if(activity.status){
      activity.status = parseInt(activity.status);
    }
  
    if(activity.numberLimit){
      activity.numberLimit = parseInt(activity.numberLimit);
    }
    
    const _id = activity._id;

    if(_id){
      activity._openid = undefined;
      activity._id = undefined;
      activity = lodash.clone(activity); 
    }

    return new Promise(function(resolve,reject){
      wx.cloud.callFunction({
        name: "activity-save",
        data: {
          _id : _id,
          activity : activity
        },
        success: res => {
          resolve(res);
        },
        fail: err => {
          reject(err);
        }
      });
    });
  }

  signup(activityId,participant){
    return new Promise(function(resolve,reject){
      const db = wx.cloud.database();

      const signupRecord = lodash.extend({},{activityId:activityId},participant);
      signupRecord._id = undefined;
      signupRecord.userId = participant._id;
      signupRecord.languare = undefined;
      signupRecord.type = undefined;
      signupRecord._openid = undefined;
      signupRecord.attended=false;

      db.collection('signup_records').add({
        data: signupRecord,
        success: res => {
          if(res._id){
            resolve({
              success:true,
              message:'用户'+participant.name+'报名成功'
            })
          }
        },
        fail: err => {
          let message = '报名失败';
          if(err.errCode==-502001){
            message = '用户[ '+participant.name+' ]已经报名该活动，无法重复报名'
          }
          reject({
            success:false,
            message:message
          })
        }
      });
    });
  }

  updateSignup(signupRecord){
    return new Promise(function(resolve,reject){
      const db = wx.cloud.database();

      const _id = signupRecord._id;
      signupRecord._id=undefined;
      signupRecord = lodash.clone(signupRecord);

      wx.cloud.callFunction({
        name: "updateSignup",
        data: {
          _id : _id,
          signupRecord : signupRecord
        },
        success: res => {
          resolve({
            success:true,
            message:'更新报名信息成功'
          });
        },
        fail: err => {
          reject({
            success:false,
            message:'更新报名信息失败'
          });
        }
      });   
    });
  }

  signout(_id){
    return new Promise(function(resolve,reject){
      wx.cloud.callFunction({
        name: "signout",
        data: {
          _id: _id,
        },
        success: res => {
          resolve({
            success:true,
            message:'成功'
          });
        },
        fail: err => {
          reject({
            success:false,
            message:'失败'
          });
        }
      });      
    });
  }

  getTypes(){
    return this.types;
  }

  getStatus(){
    return this.status;
  }

}

module.exports = new ActivityService();