module.exports.getPath = '/customRule/:itemId'

const app = global.app
const { mongo } = app.utils
const db = mongo.db()
const ObjectId = mongo.pmongo.ObjectId
const getMiniProgramList = require('../../common/getMiniProgram')

module.exports.get = async function (ctx, next) {
  const { itemId } = ctx.params
  const { fromUrl } = ctx.query
  if (!ObjectId.isValid(itemId)) {
    await ctx.render('error', {
      status: 404,
      msg: `, 规则ID: ${itemId} 格式错误`
    })
    // await next();
    return
  }
  const { userId } = await ctx.getUserInfo()
  const rule = await db.projects.findOne({ _id: ObjectId(itemId) })
  const miniProgramList = await getMiniProgramList()
  let miniProgramUrl
  let miniCodeUrl
  let miniProgramId = miniProgramList[0]?.id || 'gh_f4ed5c9ec384' // 默认取第一个"网校活动"小程序 id gh_96393e3ad64c
  console.log(4)

  if (rule.themeId) {
    const theme = await db.themes.findOne({ _id: ObjectId(rule.themeId) })
    rule.auditStatus = theme.auditStatus
    if (theme.revisionData.miniProgramId)
      miniProgramId = theme.revisionData.miniProgramId // 若存在小程序id 重新赋值
    // 判断为小程序的规则项目，展示对应小程序信息
    if (theme.revisionData.componentPlat == 'miniProgram') {
      // 找到主体小程序id，获取对应信息
      const findItem = miniProgramList.find((item) => item.id === miniProgramId)
      // 小程序部分展示小程序链接等
      // 模板id前八位，小程序中使用获取json数据用
      const p = rule.themeId.slice(0, 8)
      // 小程序基础链接
      miniProgramUrl = `${findItem.path}?p=${p}&ruleId=${itemId}`
      // 小程序二维码链接
      miniCodeUrl = `${findItem.codeUrl}&p=${p}&ruleId=${itemId}`
    }
  }
  // 如果是建站工具过来的用户，默认添加协同
  if (fromUrl) {
    let partner = rule.partner || []
    if (rule.ownerId != userId && partner && partner.indexOf(userId) == -1) {
      partner.push(userId)
      rule.partner = partner
      await db.projects.update({ _id: ObjectId(itemId) }, { $set: { partner } })
    }
  }

  await ctx.render('customRule', {
    rule: rule,
    miniProgramId,
    miniProgramUrl,
    miniCodeUrl
  })
  await next()
}

module.exports.auth = true
