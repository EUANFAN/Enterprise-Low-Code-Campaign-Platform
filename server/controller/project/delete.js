/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-17 16:38:20
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:01:43
 */
const validateRoleLimit = require('../api/utils/validateRoleLimit');
const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo;

module.exports.post = async function (ctx) {
  const {
    request: {
      body: { id },
    },
  } = ctx;
  try {
    const { ownerId: ownerId, userDeptId } = await db.projects.findOne({
      _id: ObjectId(id),
    });
    await validateRoleLimit(ctx, {
      ownerId,
      userDeptId,
      permissionKey: 'deleteProject',
      permissionGroupKey: 'managerAllProject',
    });
  } catch (err) {
    return;
  }

  const dbQuery = { _id: ObjectId(id) };
  const result = await db.projects.update(dbQuery, {
    $set: { deleted: true },
  });

  ctx.data(result);
};

module.exports.auth = true;
