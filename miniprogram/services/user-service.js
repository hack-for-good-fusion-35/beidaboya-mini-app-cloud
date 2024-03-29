const _ = require('../utils/lodash.js')
const util = require('../utils/util.js')
const event = require('../utils/event')

var SUPER_ADMIN=1;
var ADMIN=2;
var NORMAL_USER=3;

class UserService{

  constructor(){
    
  }

  isAdmin(){
    const app = getApp();
    return app.globalData.userInfo && app.globalData.userInfo.type && app.globalData.userInfo.type!=NORMAL_USER;
  }

  isSuperAdmin(){
    const app = getApp();
    return app.globalData.userInfo && app.globalData.userInfo.type && app.globalData.userInfo.type==SUPER_ADMIN;
  }

  setUserInfo(userInfo,app){
    return new Promise(function(resolve,reject){
      let cacheUserInfo;
      if(cacheUserInfo=wx.getStorage({
        key: 'userInfo'
      })){
        resolve(cacheUserInfo);
      }else{
        let openid = app.globalData.openid;
        if(!openid)throw 'openid 不能为空'

        this.find({
          _id: openid
        }).then(function(userInfos){
          if(userInfos.length<1){
            userInfo._id = app.globalData.openid;
            userInfo.type=NORMAL_USER;
            return this.add(userInfo).then(function(res){
              app.globalData.userInfo=userInfo;
              event.emit('setUserInfo',userInfo);
              resolve(userInfo);
            });//用户第一次授权会在数据中添加一条信息
          }
          userInfo = userInfos[0];
          app.globalData.userInfo=userInfo;
          event.emit('setUserInfo',userInfo);
          wx.setStorage({
            key: 'userInfo',
            data: userInfo
          });
          resolve(userInfo);
        }.bind(this)).catch(function(){
          wx.showToast({
            icon: 'none',
            title: '无法获取用户信息'
          });
        }); 
      }
    }.bind(this));
  }

  updateIfDiff(userInfo){
    const app = getApp();
    return new Promise(function(resolve,reject){
        let diffFields = util.diff(userInfo,app.globalData.userInfo)
        if(!_.isEmpty(diffFields)){
          this.update(userInfo,diffFields);
        }
    }.bind(this)); 
  }

  update(userInfo,updateFields){
    const app = getApp();
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
          wx.setStorage({
            key: 'userInfo',
            data: userInfo
          });
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
    return getApp().globalData.userInfo;
  }

  getTypes(){
    return [
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
    ]
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