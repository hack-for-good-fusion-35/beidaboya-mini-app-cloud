const _ = require('../utils/lodash')

class ActivityService {
  constructor() {
    this.types = [
      {
        value: "1",
        text: "老人相关活动",
        covers_image: "http://img13.360buyimg.com/n1/jfs/t3370/315/1984719501/142392/2f47d380/583b993cN67ee086a.jpg"
      },
      {
        value: "2",
        text: "小孩相关活动",
        covers_image: "http://img13.360buyimg.com/n1/jfs/t3370/315/1984719501/142392/2f47d380/583b993cN67ee086a.jpg"
      },
      {
        value: "3",
        text: "残疾人相关活动",
        covers_image: "http://img12.360buyimg.com/n1/jfs/t3889/328/776583683/297786/ea024d8b/585b995cNa4d6e7f4.jpg"
      },
      {
        value: "4",
        text: "病人相关活动",
        covers_image: "http://img12.360buyimg.com/n1/jfs/t3889/328/776583683/297786/ea024d8b/585b995cNa4d6e7f4.jpg"
      }
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

  find(condition,start,count) {
    return new Promise(function (resolve) {
      //resolve([]);
      const db = wx.cloud.database()
      let search = db.collection('activities');
      search=condition?search.where(condition):search;
      search=start?search.skip(start):search;
      search=count?search.limit(count):search;
    
      return search.get({
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

  save(activity){
    if(!activity._id){
      return this.add(activity);
    }else{
      return this.update(activity);
    }
  }

  add(activity) {
    return new Promise(function(resolve,reject){
      const db = wx.cloud.database()
      db.collection('activities').add({
        data: activity,
        success: res => {
          if(res._id){
            activity._id=res._id
            resolve(activity)
          }else{
            throw '无法新增活动,id为空'
          }
        },
        fail: err => {
          console.error('[数据库] [新增记录] 失败：', err)
          reject(err)
        }
      })
    });
  } 

  update(activity){
    const updatedActivity=_.clone(activity);
    updatedActivity._openid=undefined;
    updatedActivity._id=undefined;
    return new Promise(function(resolve,reject){
      const db = wx.cloud.database();
      db.collection('activities').doc(activity._id).update({
        data: updatedActivity,
        success: res => {
          resolve(activity);
        },
        fail: err => {
          console.error('[数据库] [更新记录] 失败：', err)
          reject(err);
        }
      })
    });
  }

  signup(activityId,participant){
    return new Promise(function(resolve,reject){
      const db = wx.cloud.database()

      const singnupRecord = _.extend({},{activityId:activityId},participant);
      singnupRecord._id = undefined;
      singnupRecord.userId = participant._id;
      singnupRecord.languare = undefined;
      singnupRecord.type = undefined;
      singnupRecord._openid = undefined;

      db.collection('signup_records').add({
        data: singnupRecord,
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
      })
    });
  }

  getTypes(){
    return this.types;
  }

}

module.exports = new ActivityService();