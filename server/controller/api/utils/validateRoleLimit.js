/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-11 17:04:36
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-22 01:55:43
 */
// server端 角色权限校验
const validateRoleLimit = async (
  ctx,
  {
    partner,
    ownerId,
    userDeptId,
    permissionKey,
    permissionGroupKey = 'themesCenter',
  },
  isCtxData = true
) => {
  const { userId, userDeptId: myUserDeptId } = await ctx.getUserInfo();
  if (ownerId == userId || (partner && partner.indexOf(userId) > -1)) {
    // 自己的项目
    const { value: permissionKeyValue, name: permissionKeyName } =
      await ctx.validateRoleLimit(permissionKey);
    if (!permissionKeyValue) {
      isCtxData &&
        ctx.data(null, 'no_permission', `您没有${permissionKeyName}权限`);
      throw new Error(`您没有${permissionKeyName}权限`);
    }
  } else if (userDeptId.toString() == myUserDeptId.toString()) {
    // 本事业部的项目
    const { value: permissionGroupKeyValue, name: permissionGroupKeyName } =
      await ctx.validateRoleLimit([permissionGroupKey, permissionKey]);
    if (!permissionGroupKeyValue) {
      isCtxData &&
        ctx.data(null, 'no_permission', `您没有${permissionGroupKeyName}权限`);
      throw new Error(`您没有${permissionGroupKeyName}权限`);
    }
  } else {
    // 其他事业部的项目
    const { value: chooseBizUnitValue, name: chooseBizUnitName } =
      await ctx.validateRoleLimit([
        'chooseBizUnit',
        permissionGroupKey,
        permissionKey,
      ]);
    if (!chooseBizUnitValue) {
      isCtxData &&
        ctx.data(null, 'no_permission', `您没有${chooseBizUnitName}权限`);
      throw new Error(`您没有${chooseBizUnitName}权限`);
    }
  }
};

module.exports = validateRoleLimit;
