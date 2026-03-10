/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-01 19:35:53
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-05 17:38:54
 */
module.exports.getPath = '/data';

module.exports.get = async (ctx, next) => {
  let { value } = await ctx.validateRoleLimit('data');
  if (!value) {
    return ctx.render('error', {
      status: 403,
      msg: '您没有数据大盘访问权限',
    });
  } else {
    await ctx.render('data');
    await next();
  }
};

module.exports.auth = true;
