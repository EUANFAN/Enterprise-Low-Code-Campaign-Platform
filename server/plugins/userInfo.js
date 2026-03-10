async function getLegacyUserInfo(userId) {
  const { mongo } = global.app.utils
  const db = mongo.db()
  const user = await db.users.findOne({ userId })
  // 我的 为特殊群组，没有 roleId，
  // 所以 client 在 我的项目中把 “我的” 固定写为 'my' 放到 path 中
  // 然后 server 对 api/projects/my 做了特殊处理，所以此处不需要返回 我的 roleItem 了
  return {
    userId,
    workcode: user.workcode,
    userLevel: user.status,
    isWxUser: 0,
    userDeptId: user.userDeptId,
    userDept: user.userDept || 'xw',
    role: user.role
  }
}

module.exports = async function (ctx, next) {
  ctx.getUserInfo = async function () {
    let sessionInfo = await global.app.utils.session.getSessionInfo(ctx)

    if (sessionInfo) {
      let { userId } = sessionInfo
      return await getLegacyUserInfo(userId)
    }

    return {}
  }

  ctx.getUserInfoByUserId = async function (userId) {
    return await getLegacyUserInfo(userId)
  }

  await next()
}
