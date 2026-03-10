const { message } = global.app.utils;

module.exports = async function (ctx, next) {
  try {
    await next();
  } catch (e) {
    console.log('error----plugin---->', e);
    let url = ctx.req.headers.host + ctx.req.url;
    let { userId } = await ctx.getUserInfo();
    let stack = e.stack;
    message.sendErrorMessage({ url, userId }, stack);
  }
};
