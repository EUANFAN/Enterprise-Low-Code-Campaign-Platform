/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-03-25 11:38:42
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:02:01
 */
module.exports.getPath = '/data/:itemId';

const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

const validateRoleLimit = require('../api/utils/validateRoleLimit');

module.exports.get = async function (ctx, next) {
  const { itemId } = ctx.params;
  if (!ObjectId.isValid(itemId)) {
    await ctx.render('error', {
      status: 404,
      msg: `, 项目ID: ${itemId} 格式错误`,
    });
    // await next();
    return;
  }
  let permissionUserId;
  const project = await db.projects.findOne({ _id: ObjectId(itemId) });
  const { ownerId, userDeptId, partner } = project;
  try {
    permissionUserId = ownerId;
    await validateRoleLimit(
      ctx,
      {
        partner,
        ownerId,
        userDeptId,
        permissionKey: 'lookProjectData',
        permissionGroupKey: 'managerAllProject',
      },
      false
    );
  } catch (err) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${err.message}访问权限 ${
        permissionUserId ? `请联络 ${permissionUserId} 以取得存取权限` : ''
      }`,
    });
  }
  await ctx.render('data', { project });
  await next();
};

module.exports.auth = true;
