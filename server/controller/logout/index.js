const { utils } = global.app;

module.exports = async function (ctx, next) {
  const { sessionId } = ctx.session;
  let sessionKey = utils.session.getSessionKey(sessionId);
  let res = await utils.session.clearSession(sessionKey);
  if (res) {
    ctx.sso.logout('/projects/my');
  }
  await next();
};
