const Router = require('koa-router')
const checkLogin = require('./checkLogin')
const { mongo, urls, uploader, screenShot, message } = global.app.utils
const otherBaseUrl = urls.otherBaseUrl
const db = mongo.db()
const ObjectId = mongo.pmongo.ObjectId
const { DEFAULT_POSTER } = require('../../constants')
const validateRoleLimit = require('./utils/validateRoleLimit')
const router = new Router({ prefix: '/rule' })

router.use(checkLogin)

// 生成create 的log 记录
async function createLog(newRuleId, userId, name) {
  const newLogId = ObjectId()
  const now = new Date()
  const logInstance = {
    _id: newLogId,
    args: {},
    action: 'create',
    content: null,
    createdAt: now,
    itemId: newRuleId,
    itemType: 'rule',
    performer: userId,
    version: '2.0',
    ownerId: userId,
    name: name || '未命名项目',
    poster: DEFAULT_POSTER
  }

  await db.logs.insert(logInstance)
  return newLogId
}
// 新建规则项目
router.post('/createRule', async (ctx) => {
  const {
    request: {
      body: { name, ruleWidget, remoteUrl, origin, isThemeRule, business, tags }
    }
  } = ctx

  const now = new Date()
  const { userId, userDeptId } = await ctx.getUserInfo()
  const newRuleId = ObjectId()
  const newLogId = await createLog(newRuleId, userId, name)
  const ruleInstance = {
    _id: newRuleId,
    status: 0,
    name: name || '未命名项目',
    ownerId: userId,
    deleted: false,
    origin,
    createdAt: now,
    pagepv: 0,
    pageuv: 0,
    sharepv: 0,
    shareuv: 0,
    lastModified: now,
    lastPublished: null,
    revisionId: newLogId,
    revisionData: {},
    parentId: null,
    roleId: null,
    version: '3.0',
    poster: DEFAULT_POSTER,
    userDeptId,
    ruleWidget,
    remoteUrl,
    themeId: null,
    business: business, // 业务类型
    isThemeRule: isThemeRule || null,
    tags
  }

  let rule = await db.projects.insert(ruleInstance)
  // 找到对应组件名称，给该组件对应的count +1
  let component = await db.components.find({ type: ruleWidget.type })
  // 更新版本
  await db.components.update(
    { type: ruleWidget.type },
    { $set: { count: component[0].count ? component[0].count + 1 : 1 } }
  )
  ctx.data({ rule: rule })
})

/**
 * 更新规则组件.
 */
router.post('/updateRule/:ruleId', async (ctx) => {
  const {
    params: { ruleId },
    request: {
      body: { ruleData, ruleWidget, action }
    }
  } = ctx
  const { userId } = await ctx.getUserInfo()
  let rule = await db.projects.findOne({ _id: ObjectId(ruleId) })

  // 项目保存权限角色校验
  try {
    const { ownerId, userDeptId, partner } = rule
    const permissionKeyConfig = {
      update: 'saveProject',
      publish: 'publishProject'
    }

    if (action !== 'update' && action !== 'publish') return

    const validateRoleLimitData = {
      partner,
      ownerId,
      userDeptId,
      permissionKey: permissionKeyConfig[action],
      permissionGroupKey: 'managerAllProject'
    }

    await validateRoleLimit(ctx, validateRoleLimitData)
  } catch (error) {
    return
  }

  let updateObj = {
    lastModified: new Date(),
    status: action === 'publish' ? 4 : 0,
    lastPublished: action === 'publish' ? new Date() : null
  }

  if (ruleData) {
    updateObj['revisionData'] = JSON.parse(ruleData)
    updateObj['ruleWidget'] = ruleWidget
  }

  // 更新项目数据.
  await db.projects.update({ _id: ObjectId(ruleId) }, { $set: updateObj })

  // 规则项目截图.
  if (rule.remoteUrl) {
    let ruleUrl = `${rule.remoteUrl}&ruleId=${ruleId}`
    screenShot(ruleUrl, ObjectId(ruleId))
  }

  await ctx.log(ruleId, action)

  // 发送知音楼消息
  if (action === 'publish') {
    message.sendMessage(userId, ruleId, rule, 'publish')
  }

  ctx.data({})
})

// 根据模板创建规则项目
router.post('/createRuleByTheme', async (ctx) => {
  const {
    request: {
      body: { name, themeId, themeRuleId, tags }
    }
  } = ctx
  let newRuleId = ObjectId()
  let rule = await db.projects.findOne({ _id: ObjectId(themeRuleId) })
  const { userId, userDeptId } = await ctx.getUserInfo()
  // 清理之前的项目修改信息
  delete rule.lastPublished
  const newLogId = await createLog(newRuleId, userId, name)

  // 拼接远程地址
  let category = uploader.getCategory()
  let onlineUrl = ''
  if (!rule.remoteUrl) {
    // 没有填写外部链接的规则模板
    const url = otherBaseUrl('business', rule.business)
    if (category) {
      onlineUrl = `${url}/${category}/${themeId}.html`
    } else {
      onlineUrl = `${url}/${themeId}.html`
    }
  } else {
    onlineUrl = rule.remoteUrl
  }
  if (rule.revisionData && rule.revisionData.hasOwnProperty('sGroupId')) {
    rule.revisionData.sGroupId = ''
  }
  Object.assign(rule, {
    _id: newRuleId,
    isThemeRule: null,
    name: name,
    roleId: null,
    createdAt: new Date(),
    lastModified: new Date(),
    lastPublished: null,
    revisionId: newLogId,
    ownerId: userId,
    userDeptId,
    status: 0,
    remoteUrl: onlineUrl,
    tags
  })
  let result = await db.projects.save(rule)
  ctx.data(result)
})

router.get('/getRule', async (ctx) => {
  const {
    query: { ruleId }
  } = ctx
  const rule = await db.projects.findOne({ _id: ObjectId(ruleId) })
  ctx.data(rule)
})

// 获取规则模板最新版的规则组件的版本
router.get('/getThemeRuleVersion/:themeId', async (ctx) => {
  const {
    params: { themeId }
  } = ctx
  let rule = '',
    result = null
  const theme = await db.themes.findOne({ _id: ObjectId(themeId) })
  if (theme.ruleId) {
    rule = await db.projects.findOne({ _id: ObjectId(theme.ruleId) })
    if (rule.status == 4) {
      result = rule.ruleWidget
    }
  }
  ctx.data(result)
})

// 规则绑定模板
router.post('/ruleBindThme/:ruleId', async (ctx) => {
  const {
    params: { ruleId },
    request: {
      body: { themeId }
    }
  } = ctx
  await db.projects.update(
    { _id: ObjectId(ruleId) },
    { $set: { themeId: themeId } }
  )
  ctx.data({})
})

module.exports = router
