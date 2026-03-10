const Promise = require('bluebird')
const validateRoleLimit = require('../api/utils/validateRoleLimit')
const helper = require('./helper')
const md5 = require('md5')
const app = global.app
const { utils, config } = app
const db = utils.mongo.db()
const message = utils.message
const urls = utils.urls
const ObjectId = utils.mongo.pmongo.ObjectId
const getMiniProgramList = require('../../common/getMiniProgram')

/**
 * 发布页面，渲染
 * @param  {Object}   ctx  上下文
 * @param  {Function} next 继续执行函数
 */

module.exports.get = async function (ctx) {
  const {
    query: { id: projectId, env, editorType }
  } = ctx
  const { userId } = await ctx.getUserInfo()

  let permissionUserId
  try {
    if (editorType) {
      //
      const { ownerId } = await db.themes.findOne({ _id: ObjectId(projectId) })
      permissionUserId = ownerId
      if (ownerId) {
        // 编辑模板角色校验
        const { userDeptId } = await db.users.findOne({ userId: ownerId })
        await validateRoleLimit(
          ctx,
          { ownerId, userDeptId, permissionKey: 'modifyTheme' },
          false
        )
      }
    } else {
      // 发布项目权限角色校验
      const { ownerId, userDeptId, partner } = await db.projects.findOne({
        _id: ObjectId(projectId)
      })
      permissionUserId = ownerId
      await validateRoleLimit(
        ctx,
        {
          partner,
          ownerId,
          userDeptId,
          permissionKey: 'publishProject',
          permissionGroupKey: 'managerAllProject'
        },
        false
      )
    }
  } catch (err) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${err.message}访问权限 ${
        permissionUserId ? `请联络 ${permissionUserId} 以取得存取权限` : ''
      }`
    })
  }
  let log_id = ''
  // 1. 获取项目数据
  let dbQuery = { _id: ObjectId(projectId) }
  // editorType 存在则 发布模板
  let project = editorType
    ? await db.themes.findOne(dbQuery)
    : await db.projects.findOne(dbQuery)

  if (!project) {
    return false
  }
  const { revisionData } = project
  const isTheme = editorType ? true : false
  // 发布项目
  let result = await helper.publish.bind(ctx)(project, projectId, env, isTheme)
  console.log('🚀 ~ file: publish.js ~ line 81 ~ result', result)
  const $set = { status: 0 }

  if (env !== 'online_test') {
    $set['status'] = 4
  }
  // 更新项目状态
  if (editorType) {
    db.themes.update({ _id: ObjectId(projectId) }, { $set })
  } else {
    db.projects.update({ _id: ObjectId(projectId) }, { $set })
  }

  const miniProgramList = await getMiniProgramList()
  // 小程序id
  let miniprogramId = ''
  // 基础路径
  let miniprogramUrl = ''
  // 二维码地址
  let minicodeUrl = ''

  if (revisionData.componentPlat == 'miniProgram') {
    let envMap = {
      dev: 'local',
      test: 'test',
      gray: 'gray',
      prod: 'production'
    }
    // 小程序坏境变量
    let penv
    if (app.env !== 'prod') {
      penv = envMap[app.env]
    } else {
      penv = env == 'online_test' ? 'sandbox' : 'production'
    }
    // prettier-ignore
    miniprogramId = revisionData.miniProgramId || miniProgramList[0]?.id || 'gh_96393e3ad64c'
    // prettier-ignore
    const programItem = miniProgramList.find((item) => item.id === miniprogramId)
    const pram = `p=${projectId.slice(0, 8)}&penv=${penv}`

    minicodeUrl = `${programItem.codeUrl}&${pram}`
    miniprogramUrl = `${programItem.path}?${pram}`
    if (revisionData.ruleId) {
      minicodeUrl = `${minicodeUrl}&ruleId=${revisionData.ruleId}`
      miniprogramUrl = `${miniprogramUrl}&ruleId=${revisionData.ruleId}`
    }
  }
  // 获取短链
  const source_url = encodeURIComponent(result.onlineUrl)
  const shortTimestamp = Math.floor(Date.now() / 1000)
  let shortUrlRes = await utils.api({
    url: config.get('3rd').shortUrl,
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8'
    },
    timeout: 6000,
    data: {
      source_url,
      introduction: revisionData.name,
      timestamp: shortTimestamp,
      sign: md5(source_url + shortTimestamp + 'jXH33mAf')
    }
  })

  let shortUrl = (shortUrlRes.data || {}).short_url

  // 分开发布各个页面，方便截图
  const pages = revisionData.pages.map((page, index) => {
    return {
      url: urls.previewUrl(projectId, index, log_id, editorType),
      ...page
    }
  })

  const themeGroup = await db.themeGroups.findOne({
    _id: project.themeGroupId
  })
  // 渲染发布页面
  await ctx.render('project/publish', {
    title: `H5 - 发布 [${result.name}]`,
    url: result.onlineUrl,
    shortUrl,
    jsonUrl: result.jsonUrl,
    themeGroupType: themeGroup && themeGroup.type,
    project: project,
    client: project.client,
    pages,
    useData: revisionData.useData && revisionData.dataUrl,
    config: project.config,
    miniprogramId, // 小程序id
    miniprogramUrl, // 基础路径
    minicodeUrl, // 二维码地址
    isTheme: editorType ? true : false
  })
  // 发送知音楼消息
  message.sendMessage(userId, projectId, project, env)
  // 发布hybrid，已经被替代
  // message.sendMessageToHybrid(projectId, env);
}

/**
 * 批量发布发布 ajax接口
 *
 * @param  {Object}   ctx  上下文
 * @param  {Function} next 继续执行函数
 */
module.exports.post = async function (ctx) {
  let {
    request: {
      body: { ids }
    }
  } = ctx
  const projectIds = ids && typeof ids === 'string' ? ids.split(',') : []
  const result = await Promise.map(projectIds, async (id) => {
    const dbQuery = { _id: ObjectId(id) }
    let project = await db.projects.findOne(dbQuery)
    return await helper.publish.bind(ctx)(project, id)
  })
  ctx.data({ result })
}

module.exports.auth = true
