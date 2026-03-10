/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-03-25 11:38:42
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-22 02:18:17
 */
const validateRoleLimit = require('../api/utils/validateRoleLimit');
const app = global.app;

const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

module.exports.getPath = '/log/:itemId';

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
  const project = await db.projects.findOne({ _id: ObjectId(itemId) });
  const { ownerId, userDeptId: ownerUserDeptId, partner } = project;
  try {
    await validateRoleLimit(
      ctx,
      {
        partner,
        ownerId,
        userDeptId: ownerUserDeptId,
        permissionKey: 'lookProjectLog',
        permissionGroupKey: 'managerAllProject',
      },
      false
    );
  } catch (error) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${error.message}访问权限`,
    });
  }
  await ctx.render('log', { project });
  await next();
};

module.exports.auth = true;
