module.exports.getPath = '/portal(/.*)?';
module.exports.get = async (ctx, next) => {
  const { value, name } = await ctx.validateRoleLimit('projectCenter');
  if (!value) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${name}访问权限`,
    });
  }
  await ctx.render('portal');
  await next();
};

module.exports.auth = true;
