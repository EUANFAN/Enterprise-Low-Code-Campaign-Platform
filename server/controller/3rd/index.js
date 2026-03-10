const jwt = require('jsonwebtoken');
const { utils } = global.app;

module.exports.getPath = '/3rdEnter';
module.exports.get = async function (ctx) {
  const {
    query: { appid, appkey, token, redirect },
  } = ctx;
  if (redirect) {
    ctx.redirect(redirect);
    return;
  }
  const {
    ticket,
    username: userId,
    workcode,
    department,
    userDeptId,
    userDept,
  } = await ctx.sso.getLoginInfoFromCode(token, appkey, appid);
  if (userId) {
    let { role } = await utils.updateLoginStatus(
      userId,
      workcode,
      department,
      userDeptId,
      userDept
    );
    // 将用户的信息同步到ctx.session 中
    await utils.session.syncSession(
      ctx,
      userId,
      ticket,
      workcode,
      department,
      userDeptId,
      role
    );
    const sessionId = ctx.session.sessionId;
    const tokenSecret = global.app.config.get('app').jwtConfig.tokenSecret;
    const expiresIn = global.app.config.get('app').jwtConfig.expiresIn;
    const h5Token = jwt.sign(
      {
        userId,
        workcode,
        sessionId,
      },
      tokenSecret,
      {
        expiresIn,
      }
    );
    // 建立用户组
    ctx.data({
      token: h5Token,
    });
  } else {
    ctx.data(null, -1, 'token已失效');
  }
};
module.exports.auth = false;
