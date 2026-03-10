const preload = require('./helper/preload')
const app = global.app
const { mongo, script, uploader } = app.utils
const db = mongo.db()
const { ObjectId } = mongo.pmongo

module.exports.get = async function (ctx) {
  const {
    query: { id, current_page, log_id, isTheme }
  } = ctx
  let resources = []
  let project = {}
  let projectData = {}
  let client = []
  if (log_id && !isTheme) {
    // 版本回滚时的iframe
    project = await db.logs.findOne({ _id: ObjectId(log_id) })
    projectData = project.content || project
    const logProject = await db.projects.findOne({ _id: ObjectId(id) })
    client = logProject.client
  } else {
    // const theme = await db.themes.findOne({ '_id': ObjectId(id) });
    project =
      isTheme == 'true'
        ? await db.themes.findOne({ _id: ObjectId(id) })
        : await db.projects.findOne({ _id: ObjectId(id) })
    if (!project) {
      await ctx.render('error', {
        status: 404,
        msg: '项目ID不合法'
      })
      return
    }
    projectData = project.revisionData || project
    client = project.client
  }
  // 查找生态组件，并解析依赖的js
  let preloadScripts = await script.getProjectPreloadScripts(
    projectData,
    function (widget) {
      if (projectData.dynamicLoadScript) {
        return false
      } else {
        return widget.visible == true
      }
    },
    function (trigger) {
      return trigger.version
    },
    false
  )
  let lazyloadScripts = await script.getProjectPreloadScripts(
    projectData,
    function (widget) {
      return widget.visible == false
    },
    function (trigger) {
      return !trigger.version
    },
    false
  )
  let styles = []
  // 如果项目类型是小程序，上传json到预览目录
  if (projectData.componentPlat == 'miniProgram') {
    if (typeof id == 'string') {
      await uploader.uploadFileContent(
        `${id.slice(0, 8)}.json`,
        JSON.stringify(project.revisionData),
        '',
        true
      )
    }
  }

  preload(projectData, resources)
  let projectTitle = projectData.title
  if (current_page !== undefined) {
    projectData.pages = [projectData.pages[current_page]]
  }
  if (projectData.dynamicLoadScript) {
    lazyloadScripts = []
  }

  await ctx.render(
    'project/preview',
    {
      title: projectTitle,
      project: { ...projectData, _id: project._id },
      client: client,
      scripts: preloadScripts,
      lazyloadScripts,
      styles,
      resources
    },
    false,
    true
  )
}
