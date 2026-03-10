module.exports.getPath = '/rulePreview';

module.exports.get = async (ctx, next) => {
  ctx.set('X-Frame-Options', 'ALLOWALL');
  await ctx.render('rulePreview');
  await next();
};

module.exports.auth = false;
