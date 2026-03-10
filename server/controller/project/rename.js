/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-03-25 11:38:42
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-22 02:21:19
 */
const _ = require('lodash');
const validateRoleLimit = require('../api/utils/validateRoleLimit');
const app = global.app;
let db = app.utils.mongo.db();
let ObjectId = app.utils.mongo.pmongo.ObjectId;

module.exports.post = async function (ctx, next) {
  const {
    query: { id, name, type },
  } = ctx;
  if (type == 'theme') {
    const { ownerId } = await db.themes.findOne({ _id: ObjectId(id) });
    const { userDeptId } = await db.users.findOne({ userId: ownerId });
    try {
      await validateRoleLimit(ctx, {
        ownerId,
        userDeptId,
        permissionKey: 'copyTheme',
      });
    } catch (error) {
      return;
    }
  }
  if (type == 'projects') {
    const { ownerId, userDeptId, partner } = await db.projects.findOne({
      _id: ObjectId(id),
    });
    try {
      await validateRoleLimit(ctx, {
        partner,
        ownerId,
        userDeptId,
        permissionKey: 'renameProject',
        permissionGroupKey: 'managerAllProject',
      });
    } catch (error) {
      return;
    }
  }
  const collectionMap = {
    theme: 'themes',
    project: 'projects',
  };
  let dbQuery = { _id: ObjectId(id) };
  const collection = collectionMap[type] || 'projects';
  let project = await db[collection].findOne(dbQuery);
  let oldName = project.name;
  if (!project) {
    ctx.data(null, 'not_exist_error', '项目不存在');
    await next();
    return;
  }

  _.merge(project, {
    name: name || project.name,
  });
  let rs = await db[collection].save(project);

  ctx.data(rs);
  ctx.log(id, 'rename', {
    oldName,
    name,
  });
  await next();
};

module.exports.post.auth = true;
