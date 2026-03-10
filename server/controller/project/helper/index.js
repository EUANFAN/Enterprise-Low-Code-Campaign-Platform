let _ = require('lodash')
let preload = require('./preload')
let jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM()
let React = require('react')
let ReactDOM = require('react-dom')
const app = global.app
const { mongo, uploader, script, screenShot, urls } = app.utils
const db = mongo.db(app.utils)
const { ObjectId } = mongo.pmongo
const { message } = global.app.utils
const localStorage = require('localStorage')
const {
  renderToString
} = require('react-dom/cjs/react-dom-server.node.production.min.js')
const PAGE_STATE_VAR_TAG_REGEX = /\$\{(\w+)\.(\w+)\}/g
const PROJECT_VARIABLE_REGEX = /\$\{(\w+)\.(\w+)\.(\w+)\}/g
function hasVariable(value) {
  if (
    (typeof value == 'string' &&
      new RegExp(PAGE_STATE_VAR_TAG_REGEX).test(value)) ||
    new RegExp(PROJECT_VARIABLE_REGEX).test(value)
  ) {
    return '示例公司'
  }
  return value
}

module.exports.publish = async function (project, projectId, env, isTheme) {
  let ctx = this
  let resources = []
  const newProject = _.cloneDeep(project)
  const {
    revisionData: {
      descUrl, // eslint-disable-line no-unused-vars
      descriptions, // eslint-disable-line no-unused-vars
      ...revisionData
    }
  } = newProject
  newProject.revisionData = revisionData

  let templateFile = 'project/preview'
  let godPath = ''
  if (process.env.NODE_ENV == 'dev') {
    godPath = '../../../../client/common/god.js'
  } else {
    godPath = '../../../../client-babel/common/god.js'
  }
  let god = require(godPath).default
  const cacheGodModule = require.cache[require.resolve(godPath)]
  if (cacheGodModule.parent) {
    cacheGodModule.parent.children.splice(
      cacheGodModule.parent.children.indexOf(cacheGodModule),
      1
    )
  }

  delete require.cache[require.resolve(godPath)]
  const window = dom.window
  Object.assign(global, {
    document: window.document,
    navigator: window.navigator,
    location: window.location,
    localStorage: localStorage,
    sessionStorage: localStorage,
    React,
    ReactDOM,
    god
  })
  // 1 查找生态组件，并解析依赖的js
  let preloadScripts = []
  let needHydrate = true
  try {
    preloadScripts = await script.getProjectPreloadScripts(
      newProject.revisionData,
      function (widget) {
        if (newProject.revisionData.dynamicLoadScript) {
          return false
        } else {
          return widget.visible !== false
        }
      },
      function (trigger) {
        return trigger.version
      },
      true
    )
  } catch (error) {
    needHydrate = false
  }
  // 外部组件css链接
  let mainStyles = await script.getSSRComponentStyle(newProject.revisionData)
  let lazyloadScripts = await script.getProjectPreloadScripts(
    newProject.revisionData,
    function (widget) {
      return widget.visible == false
    },
    function (trigger) {
      return !trigger.version
    },
    true
  )
  if (newProject.revisionData.dynamicLoadScript) {
    lazyloadScripts = []
  }
  // 5. 获取图片资源，预加载需要
  preload(newProject.revisionData, resources)
  let mainHTML = '' // renderToString(<App />);
  let title = hasVariable(newProject.revisionData.title)
  let data = {
    title: title,
    businessLine: newProject.businessLine,
    keywords: newProject.revisionData.keywords,
    description: newProject.revisionData.description,
    project: { ...newProject.revisionData, _id: newProject._id },
    scripts: preloadScripts,
    lazyloadScripts,
    mainStyles,
    resources,
    STATIC_URL: urls.STATIC_URL,
    client: newProject.client,
    mainHTML,
    needHydrate
  }
  global.PageData = data

  try {
    let appPath = ''
    if (process.env.NODE_ENV == 'dev') {
      appPath = '../../../../client/page/project/preview/App'
    } else {
      appPath = '../../../../client-babel/page/project/preview/App'
    }

    let App = require(appPath).default
    const cacheModule = require.cache[require.resolve(appPath)]
    if (cacheModule.parent) {
      cacheModule.parent.children.splice(
        cacheModule.parent.children.indexOf(cacheModule),
        1
      )
    }
    delete require.cache[require.resolve(appPath)]
    mainHTML = await renderToString(<App />)
    console.log('🚀 ~ file: index.js ~ line 146 ~ mainHTML', mainHTML)
  } catch (e) {
    let url = ctx.req.headers.host + ctx.req.url
    let { userId } = await ctx.getUserInfo()
    let stack = e.stack
    message.sendErrorMessage({ url, userId }, stack)
  }

  data.mainHTML = mainHTML
  // 5 处理模板（如果是活动还需把 project 和 html 要存储到redis），这里加载了基本的js ，但是Omega PageData 都没有
  let html = await ctx.render(templateFile, Object.assign({}, data), true, true)
  console.log('🚀 ~ file: index.js ~ line 157 ~ html', html)
  let uploadResult, htmlName, uploadJSON

  htmlName = projectId + '.html'

  uploadResult = await uploader.uploadFileContent(htmlName, html, env)
  // 发布项目html文件时，同步创建包含revisionData的json文件,文件路径为`https://h5.xueersi.com/${env}/${projectId}.json`
  // json文件里project下增加一个preloadTriggers数据
  revisionData.usedComponents = {
    usedTriggers: await script.getProjectTriggerTypes(
      revisionData,
      function (trigger) {
        return (
          trigger.version &&
          (trigger.event !== 'enter' || trigger.event !== 'willmount')
        )
      }
    )
  }
  // revisionData内没有projectId,现在就这样僵硬地加上
  revisionData.projectId = projectId
  if (typeof projectId == 'string') {
    uploadJSON = await uploader.uploadFileContent(
      `${projectId.slice(0, 8)}.json`,
      JSON.stringify(revisionData),
      env
    )
  }
  // 7 上传到通道中
  // way.set(projectId + ':tpl', tpl);
  // way.set(projectId + ':data', JSON.stringify(data));

  // 9 发布为当前环境数据接口(大运营体系环境问题)
  // if (newProject.revisionData.dataUrl && /\/beatles\/campaign\/operation\/activity\/index/g.test(newProject.revisionData.dataUrl)) {
  //   newProject.revisionData.dataUrl = newProject.revisionData.dataUrl.replace(/.*\/beatles\/campaign\/operation\/activity\/index/g, () => {
  //     return '/activity/index';
  //   }s);
  // }

  // 10 上传成功需要更新发布时间
  if (uploadResult.errno == 0) {
    await db.projects.update(
      { _id: ObjectId(projectId) },
      { $set: { lastPublished: new Date() } }
    )
  }
  let url = uploadResult.data.file_url_https
  let jsonUrl = uploadJSON.data.file_url_https
  if (app.env == 'dev') {
    url = url.replace('https:', 'http:')
    jsonUrl = jsonUrl.replace('https:', 'http:')
  }
  if (project.ruleId || project.ruleWidget) {
    const ruleId = project.ruleId || project._id
    url =
      env === 'online_test'
        ? `${url}?ruleId=${ruleId}&type=gray`
        : `${url}?ruleId=${ruleId}`
  }
  // 此处解决本地截图问题
  url = url.replace(/(m\.xueersi\.com\/oss)/g, 'h5.xueersi.com')
  jsonUrl = jsonUrl.replace(/(m\.xueersi\.com\/oss)/g, 'h5.xueersi.com')
  screenShot(url, ObjectId(projectId), isTheme)
  // 如果当前页面的来源是优选课或爆品课，页面的来源变为h5.xueersi.com/enter?type=yxk&id=项目id
  const category =
    (env == 'online_test' ? '_online_test_/' : '') +
    uploader.getCategory(htmlName)
  return {
    onlineUrl: url,
    jsonUrl: jsonUrl,
    name: title,
    projectId,
    env: category
  }
}
