module.exports = async function (ctx, next) {
  ctx.isAjax = function () {
    // 是否是异步请求
    if (ctx.request.headers['x-requested-with']) {
      return true;
    }
    return false;
  };

  await next();
};
