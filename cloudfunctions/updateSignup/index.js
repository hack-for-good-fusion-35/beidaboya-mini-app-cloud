// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  let signupRecord = event;
  let id = signupRecord._id;
  signupRecord._id = undefined;

  return await db.collection('signup_records').doc(id).update({
    data: signupRecord
  });
}