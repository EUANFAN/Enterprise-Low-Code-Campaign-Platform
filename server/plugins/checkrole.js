/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-05-30 20:03:05
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-22 20:25:19
 */

function tileObject(obj) {
  let keys = Object.keys(obj);
  keys.map((key) => {
    if (typeof obj[key] == 'object') {
      if (obj[key].children) {
        let childrenObj = obj[key].children;
        delete obj[key].children;
        return Object.assign(obj, tileObject(childrenObj));
      }
    }
  });
  return obj;
}

async function validateRoleLimit(userId, permissionName) {
  const { mongo } = global.app.utils;
  const db = mongo.db();
  const { role } = await db.users.findOne({ userId });
  const { permissionRule } = await db.userRoles.findOne({ name: role });

  let perObj = tileObject(permissionRule);

  if (permissionName instanceof Array) {
    return {
      value: permissionName.every((p) => perObj[p].value == 1),
      name: permissionName
        .map((p) => (perObj[p].value != 1 ? perObj[p].name : ''))
        .filter((i) => i)
        .join(','),
    };
  } else {
    return {
      value: perObj[permissionName].value == 1,
      name: perObj[permissionName].name,
    };
  }
}
module.exports = async function (ctx, next) {
  ctx.validateRoleLimit = async function (permissionName) {
    let { userId } = await ctx.getUserInfo();
    if (!userId)
      return {
        value: true,
        name: '',
      };
    return await validateRoleLimit(userId, permissionName);
  };

  ctx.getRolePermissionList = async function (roleName) {
    const { mongo } = global.app.utils;
    const db = mongo.db();
    const { permissionRule = {} } =
      (await db.userRoles.findOne({ name: roleName })) || {};
    return tileObject(permissionRule);
  };

  await next();
};
