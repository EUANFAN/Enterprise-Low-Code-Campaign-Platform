const request = require('request')
const app = global.app
const { config, utils } = app
const { mongo } = utils
const getInnerWidgets = require('../../common/getInnerWidgets')
const validateRoleLimit = require('../api/utils/validateRoleLimit')
const services = config.get('3rd').services
const db = mongo.db()
const ObjectId = mongo.pmongo.ObjectId
function tryFetchProjectDesc(projectId, descUrl) {
  return new Promise(function (resolve) {
    request(descUrl, function (error, response, body) {
      let descResult = []

      try {
        let json = JSON.parse(body)
        descResult = json.data
      } catch (e) {
        // Do nothing
      }

      db.projects
        .update(
          { _id: ObjectId(projectId) },
          { $set: { descriptions: descResult } }
        )
        .then(() => {
          resolve(true)
        })
    })
  })
}

module.exports.getPath = '/editor/(project)?/:projectId'

module.exports.get = async function (ctx) {
  const {
    params: { projectId }
  } = ctx

  let { userId } = await ctx.getUserInfo()

  if (!ObjectId.isValid(projectId)) {
    await ctx.render('error', {
      status: 404,
      msg: `, 项目ID: ${projectId} 格式错误`
    })
    return
  }
  // 进入项目编辑权限角色校验
  let permissionUserId
  try {
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
        permissionKey: 'lookProject',
        permissionGroupKey: 'managerAllProject'
      },
      false
    )
  } catch (err) {
    return ctx.render('error', {
      status: 403,
      msg: `您没有${err.message}访问权限 ${
        permissionUserId ? `请联络 ${permissionUserId} 以取得存取权限` : ''
      }`
    })
  }

  let dbQuery = {
    _id: ObjectId(projectId)
  }

  let project = await db.projects.findOne(dbQuery)
  if (project) {
    if (project.deleted) {
      await ctx.render('error', {
        status: 404,
        msg: '项目已删除'
      })
      return
    }

    let projectId = project._id

    if (project.revisionData.dataUrl && project.revisionData.descUrl) {
      await tryFetchProjectDesc(projectId, project.revisionData.descUrl)
      project = await db.projects.findOne(dbQuery)
    }

    project.editable = true

    // 获取用户安装组件列表
    let user = await db.users.findOne({
      userId: userId
    })
    let components = []
    for (var key in user.components) {
      components.push(key)
    }
    let installedComponents = await db.components.find({
      type: { $in: components },
      isDeleted: {
        $ne: true
      }
    })
    let installedComponentInfos = {}
    installedComponents.map((component) => {
      let {
        name,
        type,
        category,
        version,
        widgetUrl,
        isInner,
        isCommon,
        group,
        useLifecycle
      } = component
      installedComponentInfos[component.type] = {
        name,
        type,
        category,
        version,
        widgetUrl,
        isInner,
        isCommon,
        group,
        useLifecycle
      }
    })
    // installedComponentInfos 当前组件中最新的版本
    const innerWidgets = await getInnerWidgets()
    await ctx.render('editor/edit', {
      innerWidgets,
      title: project.name,
      project,
      client: project.client,
      services,
      installed: installedComponentInfos
    })
  } else {
    await ctx.render('error', {
      status: 404,
      msg: '此项目不存在或您没权限查看此项目'
    })
  }
}

module.exports.auth = true
