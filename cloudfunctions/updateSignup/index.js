// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const data = {};
  data['participants.'+event.index+'.isAttended']=true;
  
  return await db.collection('activities').
  //doc(event.activityId).
    where({
      '_id':event.activityId,
      'participants._id':event.userId
    }).
    update({
      'data': data
    });
}