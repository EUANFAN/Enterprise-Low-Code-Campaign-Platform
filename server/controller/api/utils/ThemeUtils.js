/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-03-25 20:33:36
 * @LastEditors: jielang
 * @LastEditTime: 2021-03-27 18:41:23
 */
const { InvalidParameterError } = require('../../../errors');
const app = global.app;
const { utils } = app;
const { mongo } = utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

async function validateThemeWriteAccess(userId, themeId) {
  let promise = [
    db.users.findOne({ userId }),
    db.themes.findOne({ _id: ObjectId(themeId) }),
  ];
  const [user, theme] = await Promise.all(promise);
  if (!theme) {
    throw new InvalidParameterError('目标主题不存在');
  }
  if (theme.deleted) {
    throw new InvalidParameterError('主题已被删除');
  }
  return [user, theme];
}
module.exports = {
    validateThemeWriteAccess
};
