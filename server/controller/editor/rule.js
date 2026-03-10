/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:02:00
 */
const validateRoleLimit = require('../api/utils/validateRoleLimit');

/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-03-25 11:38:42
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-22 02:17:38
 */
const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

module.exports.getPath = '/editor/(rule)?/:projectId';

module.exports.get = async function (ctx, next) {
  const { projectId } = ctx.params;
  if (!ObjectId.isValid(projectId)) {
    await ctx.render('error', {
      status: 404,
      msg: `, 规则ID: ${projectId} 格式错误`,
    });
    // await next();
    return;
  }
  // 进入项目编辑权限角色校验
  let ownerId;
  try {
    const {
      ownerId: ownerId,
      userDeptId,
      partner,
    } = await db.projects.findOne({ _id: ObjectId(projectId) });
    await validateRoleLimit(
      ctx,
      {
        partner,
        ownerId,
        userDeptId,
        permissionKey: 'lookProject',
        permissionGroupKey: 'managerAllProject',
      },
      false
    );
  } catch (err) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${err.message}访问权限 ${
        ownerId ? `请联络 ${ownerId} 以取得存取权限` : ''
      }`,
    });
  }
  const project = await db.rules.findOne({ _id: ObjectId(projectId) });
  await ctx.render('rule', {
    project,
    isRule: true,
    origin: 'rules',
  });
  await next();
};

module.exports.auth = true;
