module.exports = async function (ctx, next) {
  ctx.condition = async function (data) {
    if ((await ctx.getUserInfo().userLevel) == 1 && data.userId) {
      delete data.userId;
    }

    return data;
  };

  await next();
};
