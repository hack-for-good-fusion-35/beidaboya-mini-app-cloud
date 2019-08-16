// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();
const _ = db.command;

const add = function(activity) {
  activity.numberJoined = 0;
  return db.collection('activities').add({
    data: activity
  }); 
} 

const update = function(_id, activity){
  return db.collection('activities').doc(_id).update({
    data: activity
  });
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  if (!event._id) {
    return await add(event.activity);
  } else {
    return await update(event._id,event.activity);
  }
  
}