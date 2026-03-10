module.exports.getPath = '/ruleManage(/.*)?';
module.exports.get = async (ctx, next) => {
  //   const { value, name } = await ctx.validateRoleLimit('themesCenter');
  //   if(!value) {
  //     return ctx.render('error', {
  //       status: 403,
  //       msg: `您没有${name}访问权限`
  //     });
  //   }
  await ctx.render('ruleManage');
  await next();
};

module.exports.auth = true;
