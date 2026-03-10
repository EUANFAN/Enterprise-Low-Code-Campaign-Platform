module.exports.getPath = '/widgets(/.*)?';

module.exports.get = async (ctx) => {
  const { value, name } = await ctx.validateRoleLimit('widgets');
  if (!value) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${name}访问权限`,
    });
  }
  await ctx.render('widgets');
};

module.exports.auth = true;
