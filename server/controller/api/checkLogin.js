module.exports = async (ctx, next) => {
  await ctx.checkAuthenticate(ctx);
  await next();
};
