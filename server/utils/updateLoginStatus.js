/*
 * @Author: your name
 * @Date: 2020-03-28 21:15:27
 * @LastEditTime: 2021-07-09 17:40:20
 * @LastEditors: jielang
 * @Description: In User Settings Edit
 * @FilePath: /x-core/server/utils/updateLoginStatus.js
 */
const app = global.app;
module.exports = async function (userId, workcode, department, userDeptId) {
  const { mongo } = app.utils;
  const db = mongo.db();
  const { freezeUserDeptId } = await db.users.findOne({ userId }) || {};
  let setObj = { lastLoginDate: new Date(), workcode: workcode };
  if (department) setObj.department = department;
  if (!freezeUserDeptId && userDeptId) setObj.userDeptId = userDeptId;
  const { value } = await db.users.findAndModify({
    query: { userId },
    update: {
      $set: setObj,
      $setOnInsert: {
        userId,
        // 默认设置用户为普通用户
        firstLoginDate: setObj.lastLoginDate,
        role: '普通用户',
        roleIds: [],
      },
    },
    upsert: true,
    new: true,
  });
  return value;
};
