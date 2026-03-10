module.exports = async function (ctx, next) {
  // TODO:
  // 增加 access log
  await next();
};
