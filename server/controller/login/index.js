const { utils, config } = global.app
const DEFAULT_PAGE = '/theme'
const sso = config.get('sso')
let params = sso.params

module.exports = async function (ctx, next) {
  const {
    query: { token }
  } = ctx
  const {
    ticket,
    username: userId,
    workcode,
    department,
    userDeptId,
    userDept
  } = await ctx.sso.getLoginInfoFromCode(token, params.app_key, params.app_id)
  if (userId) {
    let { role } = await utils.updateLoginStatus(
      userId,
      workcode,
      department,
      userDeptId,
      userDept
    )
    // 将用户的信息同步到ctx.session 中
    await utils.session.syncSession(
      ctx,
      userId,
      ticket,
      workcode,
      department,
      userDeptId,
      role
    )
    // 建立用户组
    ctx.redirect(DEFAULT_PAGE)
  } else {
    ctx.redirect(sso.urls.login)
  }
  await next()
}
