/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-17 20:25:28
 * @LastEditors: jielang
 * @LastEditTime: 2021-02-05 15:39:27
 */
module.exports.getPath = '/users(/.*)?';

module.exports.get = async (ctx) => {
  const { value, name } = await ctx.validateRoleLimit('users');
  if (!value) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${name}访问权限`,
    });
  }

  await ctx.render('users');
};

module.exports.auth = true;
