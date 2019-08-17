// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const response = await db.collection('activities').where({
    _id:event._id
  }).get();

  const activity = response.data[0];

  return await db.collection('activities').where({
    'numberJoined':_.eq(activity.numberJoined),
    'numberLimit':_.gte(activity.numberJoined+1),
    '_id':activity._id,
    'participants._id': _.neq(event.participant._id)
  }).update({
    data:{
      'numberJoined': _.inc(1),
      'participants': _.push([event.participant])
    }
  });      
}