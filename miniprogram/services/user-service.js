const _ = require('../utils/lodash.js')
const util = require('../utils/util.js')
const event = require('../utils/event')

const app = getApp()

var SUPER_ADMIN=1;
var ADMIN=2;
var NORMAL_USER=3;

class UserService{

  constructor(){
    
  }

  isAdmin(){
    return app.globalData.userInfo && app.globalData.userInfo.type && app.globalData.userInfo.type!=NORMAL_USER;
  }

  isSuperAdmin(){
    return app.globalData.userInfo && app.globalData.userInfo.type && app.globalData.userInfo.type==SUPER_ADMIN;
  }

  setUserInfo(userInfo){
    let openid = app.globalData.openid;
    return this.find({
      _id: openid
    }).then(function(userInfos){
      if(userInfos.length<1){
        userInfo._id = openid;
        userInfo.type=NORMAL_USER;
        return this.add(userInfo);//用户第一次授权会在数据中添加一条信息
      }
      userInfo = userInfos[0];
      console.info('获取到用户信息'+userInfo);
      app.globalData.userInfo=userInfo;
      event.emit('setUserInfo',userInfo);
      return userInfo;
    }.bind(this)).catch(function(){
      wx.showToast({
        icon: 'none',
        title: '无法获取用户信息'
      });
    });
  }

  updateIfDiff(userInfo){
    return new Promise(function(resolve,reject){
        let diffFields = util.diff(userInfo,app.globalData.userInfo)
        if(!_.isEmpty(diffFields)){
          this.update(userInfo,diffFields);
        }
    }.bind(this)); 
  }

  update(userInfo,updateFields){

    if(!updateFields){
      updateFields = userInfo
    }

    const updateUserInfo=_.clone(updateFields);
    updateUserInfo._openid=undefined;
    updateUserInfo._id=undefined;
    return new Promise(function(resolve,reject){
      const db = wx.cloud.database();
      db.collection('users').doc(userInfo._id).update({
        data: updateUserInfo,
        success: res => {
          app.globalData.userInfo=userInfo;
          resolve(userInfo);
        },
        fail: err => {
          console.error('[数据库] [更新记录] 失败：', err)
          reject(err);
        }
      })
    });
  }

  add(userInfo){
    return new Promise(function(resolve,reject){
      const db = wx.cloud.database()
      db.collection('users').add({
        data: userInfo,
        success: res => {
          resolve(userInfo)
        },
        fail: err => {
          console.error('[数据库] [新增记录] 失败：', err)
          reject(err)
        }
      })
    });
  }

  isLogged(){
    return app.globalData.userInfo;
  }

  find(condition){
    return new Promise(function(resolve,reject){
      //resolve([{}]);
      const db = wx.cloud.database()
      return db.collection('users').where(condition).get({
        success: function(res){
            resolve(res.data);
        }.bind(this),
        fail: err => {
          console.error('[数据库] [查询记录] 失败：', err);
          reject(err);
        }
      })
    });
  }

}

module.exports = new UserService();