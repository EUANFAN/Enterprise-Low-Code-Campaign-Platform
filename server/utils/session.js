/*
 * @Author: your name
 * @Date: 2020-02-07 21:20:43
 * @LastEditTime: 2021-07-06 10:37:31
 * @LastEditors: jielang
 * @Description: In User Settings Edit
 * @FilePath: /x-core/server/utils/session.js
 */
const uniqid = require('uniqid');
const SESSION_EXPIRE_TIME = 60 * 60 * 24; // An hour
const app = global.app;

function getSessionKey(sessionId) {
  return 'session:' + sessionId + app.env;
}

/**
 * 同步 Session 资料
 * Session 的资料会被储存在 Redis 中，而这个键会被存在用户的 Cookie 上。
 *
 * @param  {Object} ctx    Koa context
 * @param  {String} userId 用户 ID
 * @param  {String} ticket 登入用的 SSO Ticket，用来辨识用户是否登入
 */
async function syncSession(
  ctx,
  userId,
  ticket,
  workcode,
  department,
  userDeptId,
  role
) {
  const app = global.app;
  const cache = app.utils.cache;
  const sessionId = uniqid();
  const sessionKey = getSessionKey(sessionId);
  const sessionInfo = {
    userId: userId,
    ticket: ticket,
    workcode: workcode,
    department: department,
    userDeptId: userDeptId,
    role: role
  };
  await cache.set(sessionKey, sessionInfo, SESSION_EXPIRE_TIME);
  ctx.session.sessionId = sessionId;
  // const domain = app.env != 'prod' ? 'xesv5.com' : 'xiwang.com';
  ctx.cookies.set('h5admin:ssid', sessionId, {
    path: '/',
    domain: 'xiwang.com',
    maxAge: 86400000,
    httpOnly: false,
    overwrite: true
  });
  return sessionInfo;
}

/**
 * 获取session信息
 *
 * @param  {Object} ctx 上下文
 * @return {Object}     session信息
 */
async function getSessionInfo(ctx) {
  const app = global.app;
  const cache = app.utils.cache;
  let sessionId = ctx.session.sessionId;

  if (sessionId) {
    const sessionKey = getSessionKey(sessionId);
    return await cache.get(sessionKey);
  }
  return null;
}
async function clearSession(sessionKey) {
  const app = global.app;
  const cache = app.utils.cache;
  if (sessionKey) {
    return await cache.del(sessionKey);
  }
  return null;
}
module.exports = {
  syncSession,
  getSessionInfo,
  clearSession,
  getSessionKey
};
