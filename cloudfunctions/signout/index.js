// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const participantIndex = 'participants.' + event.index;

  condition = {'_id': event.activityId};
  condition[participantIndex+'._id']=event.userId;

  const data ={'numberJoined':_.inc(-1)};
  data[participantIndex]=_.remove();
  
  return await db.collection('activities').
  where(condition).
  update({
    data:data
  });
}