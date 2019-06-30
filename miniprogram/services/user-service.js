const _ = require('../utils/lodash.js')
const util = require('../utils/util.js')

const app = getApp()

var SUPER_ADMIN=0;
var ADMIN=1;
var NORMAL_USER=2;

class UserService{

  constructor(){

  }

  isAdmin(){
    return this.type==ADMIN;
  }

  isSuperAdmin(){
    return this.type==SUPER_ADMIN;
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
      return userInfos[0];
    }.bind(this)).catch(function(){
      wx.showToast({
        icon: 'none',
        title: '无法获取用户信息'
      });
    }).then(function(userInfo){
      app.globalData.userInfo=userInfo;
    });
  }

  updateIfDiff(userInfo,oldUserInfo){
    return new Promise(function(resolve,reject){
        if(util.diff(userInfo,oldUserInfo)){
          this.update(userInfo);
        }
    }.bind(this)); 
  }

  update(userInfo){
    return new Promise(function(resolve,reject){
      resolve(userInfo);
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
      resolve([{}]);
      // const db = wx.cloud.database()
      // return db.collection('users').where(condition).get({
      //   success: function(res){
      //       resolve(res.data);
      //   }.bind(this),
      //   fail: err => {
      //     console.error('[数据库] [查询记录] 失败：', err);
      //     reject(err);
      //   }
      // })
    });
  }

}

module.exports = new UserService();