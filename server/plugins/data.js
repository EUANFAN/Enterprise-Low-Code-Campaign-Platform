module.exports = async function (ctx, next) {
  ctx.data = function (data, errno, msg) {
    ctx.body = {
      errno: errno != null ? errno : 0,
      msg: msg || 'ok',
      data: data || {},
    };
  };

  await next();
};
