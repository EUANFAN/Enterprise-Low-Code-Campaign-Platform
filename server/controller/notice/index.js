module.exports.getPath = '/notice(/.*)?';
module.exports.get = async (ctx, next) => {
  await ctx.render('notice');
  await next();
};

module.exports.auth = true;
