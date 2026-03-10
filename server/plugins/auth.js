const jwt = require('jsonwebtoken')
const app = global.app
const { utils } = app
const { getSessionKey } = require('../utils/session')
/**
 * 校验是否用户已经登录
 *
 * @param  {Object}   ctx 上下文
 * @return {boolean}      校验结果
 */
async function validateUserLogin(ctx) {
  const app = global.app
  const cache = app.utils.cache
  const {
    session: { sessionId }
  } = ctx
  if (!sessionId) {
    return false
  }

  // 一个小时以后再校验,提高系统性能
  const sessionKey = getSessionKey(sessionId)
  console.log('用户信息', sessionKey, '用户信息结束')

  const sessionInfo = await cache.get(sessionKey)
  if (!sessionInfo || !sessionInfo.userId || !sessionInfo.ticket) {
    return false
  }

  return true
}

/**
 * 第三方访问校验
 *
 * @param  {Object}  ctx 上下文
 * @return {Boolean}     判断结果
 */
async function validateThirdPartyAuthenticate(ctx) {
  const { token, source, appid, appkey } = ctx.query
  // 从后台管理系统接入 根据token查找用户信息
  if (source == 'admin') {
    return await ctx.sso.getLoginInfoFromAdmin(token)
  } else {
    return await ctx.sso.getLoginInfoFromCode(token, appkey, appid)
  }
}

async function checkUserInfo(userInfo, ctx) {
  let { username } = ctx.query
  username = username && username.split('@')[0]
  const { ticket, workcode, department, userDeptId, userDept } = userInfo
  if (!userInfo) return false
  if (userInfo.username == username) {
    let { role } = await utils.updateLoginStatus(
      username,
      workcode,
      department,
      userDeptId,
      userDept
    )
    // 将用户的信息同步到ctx.session 中
    await utils.session.syncSession(
      ctx,
      username,
      ticket,
      workcode,
      department,
      userDeptId,
      userDept,
      role
    )
    return true
  }
  return false
}

/**
 * 是否为 open api 访问(第三方访问)
 *
 * @return {Boolean}     判断结果
 */
function isThirdPartyAccess() {
  let ctx = this
  const { username, token, source, appid, appkey } = ctx.query
  return Boolean(
    (username && token && source == 'admin') ||
      (appid && appkey && token && username)
  )
}
/**
 * Check if an user is authenticated. There should be 2 kinds of situations:
 * 1. User is not logged in and is from H5, session expired and invalid
 *    token included
 * 2. User is not logged in and is from MIS system, session expired and invalid
 *    token included
 *
 * For case 1, user will be redirected to login page. For case 2, we'll try
 * to re-login user with the provided ticket, if failed, send an error ajax
 * response back to MIS system
 *
 *
 * @return {Promise<void>}     Promise that resolves if user is logged in
 */
async function checkAuthenticate() {
  let ctx = this
  const {
    query: { h5Token }
  } = ctx
  // 先校验是否有效, 如果sessionId不存在，设置sessionId, 这样获取用户信息就可以不用改逻辑
  // 还有一种办法，不从session中取用户信息，直接在存jwt的时候就存上用户信息，校验和取jwt数据，获取用户信息只要涉及到session 的都要改
  if (h5Token) {
    try {
      const tokenSecret = app.config.get('app').jwtConfig.tokenSecret
      jwt.verify(h5Token, tokenSecret)
      const userInfo = jwt.decode(h5Token, tokenSecret)
      ctx.session.sessionId = userInfo.sessionId
    } catch (e) {
      return false
    }
  }

  if (await validateUserLogin(ctx)) {
    return true
  }
  // User is not logged in
  if (!ctx.isThirdPartyAccess()) {
    return false
  }
  let userInfo = await validateThirdPartyAuthenticate(ctx)
  return checkUserInfo(userInfo, ctx)
}

async function checkThirdPartyAuthenticate(ctx, next) {
  await validateThirdPartyAuthenticate(ctx)
  await next()
}

module.exports = async function (ctx, next) {
  ctx.isThirdPartyAccess = isThirdPartyAccess
  ctx.checkAuthenticate = checkAuthenticate
  ctx.checkThirdPartyAuthenticate = checkThirdPartyAuthenticate
  await next()
}
