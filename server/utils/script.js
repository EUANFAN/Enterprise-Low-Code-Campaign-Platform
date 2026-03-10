const urls = require('./urls')
const uploader = require('./uploader')
const request = require('request')
const { getWidgetInfo } = require('../common/widget.js')
const SCRIPT_NUM = 10

const getWidgetTypes = (container, filter) => {
  let types = {}
  ;(container.widgets || []).forEach((widget) => {
    // 多页面项目存在不同版本的组件
    if (!filter || (filter && filter(widget))) {
      const name = `${widget.type}-${widget.version}`
      types[name] = widget.version
      ;(widget.layers || []).forEach((layer) => {
        Object.assign(types, getWidgetTypes(layer))
      })
    }
  })
  return types
}

const getProjectWidgetTypes = (project, filter) => {
  let types = {}
  ;(project.pages || []).forEach((page) => {
    Object.assign(types, getWidgetTypes(page, filter))
  })
  return types
}

const getTriggerTypes = (container, filter) => {
  let types = {}
  ;(container.triggers || []).forEach((trigger) => {
    if (!filter || (filter && filter(trigger))) {
      const name = `${trigger.type}-${trigger.version}`
      types[name] = trigger.version
    }
  })

  ;(container.widgets || []).forEach((widget) => {
    // 对组件添加的triggers在widgets内部
    Object.assign(types, getTriggerTypes(widget, filter))
    ;(widget.layers || []).forEach((layer) => {
      Object.assign(types, getTriggerTypes(layer, filter))
    })
  })
  return types
}

const getProjectTriggerTypes = (project, filter) => {
  let types = {}
  ;(project.triggers || []).forEach((trigger) => {
    const name = `${trigger.type}-${trigger.version}`
    types[name] = trigger.version
  })
  ;(project.pages || []).forEach((page) => {
    Object.assign(types, getTriggerTypes(page, filter))
  })
  return types
}

function getComponentsData(data, num, arr) {
  if (data.length <= num) {
    arr.push(data)
  } else {
    arr.push(data.splice(0, num))
    getComponentsData(data, num, arr)
  }
  return arr
}

const getScripts = async function (usedComponents, isPublish, clazz) {
  let scripts = []
  let scriptMerge = []
  for (let componentName in usedComponents) {
    if (usedComponents[componentName]) {
      const [type, version] = componentName.split('-')
      let url = urls.componentUrl(
        componentName.split('-')[0],
        usedComponents[componentName]
      )
      let obj = {
        type,
        version,
        clazz,
        url: url,
        scriptName: `${componentName.split('-')[0]}@${
          usedComponents[componentName]
        }`
      }
      scripts.push(url)
      scriptMerge.push(obj)
    }
  }
  if (isPublish) {
    let scriptsUrl = await mergeScripts(scriptMerge)
    if (scriptsUrl.length) {
      return scriptsUrl
    }
  } else {
    return scripts
  }
}
const isSupportSSR = async function (widgets) {
  const { type, version } = widgets
  const widgetInfo = await getWidgetInfo(type, version)
  const xcliSupportSSRVersion = 0
  const support =
    widgetInfo &&
    widgetInfo.xcli &&
    parseInt(widgetInfo.xcli.split('.').join('')) >= xcliSupportSSRVersion
  return {
    type,
    isSupport: support
  }
}

const getComponentsStyle = function (widgets) {
  return Promise.all(
    widgets.map(async (widget) => {
      const widgetInfo = await isSupportSSR(widget)
      if (widgetInfo.isSupport && widget) {
        try {
          return new Promise((resolve) => {
            request.get('http:' + widget.cssLink, function (error, response) {
              if (!error && response.statusCode == 200) {
                resolve(
                  widget.cssLink.replace(
                    /(activity\.xueersi\.com)/g,
                    'm.xueersi.com'
                  )
                )
              } else {
                resolve(void 0)
              }
            })
          })
        } catch (error) {
          console.log(error)
          return void 0
        }
      }
      return void 0
    })
  ).then((res) => {
    return res.filter((link) => link)
  })
}

const getSSRComponentStyle = function (project, widgetFilter) {
  let widgetTypes = getProjectWidgetTypes(project, widgetFilter)
  const widgets = []
  for (let componentName in widgetTypes) {
    const type = componentName.split('-')[0]
    const version = widgetTypes[componentName]
    if (version) {
      let url = urls.componentUrl(type, version)
      widgets.push({
        type,
        version,
        cssLink: url.replace(/.js$/, '.css')
      })
    }
  }
  return getComponentsStyle(widgets)
}

const getProjectPreloadScripts = function (
  project,
  widgetFilter,
  triggerFilter,
  isPublish
) {
  // 预加载的组件
  let widgetTypes = getProjectWidgetTypes(project, widgetFilter)
  let triggerTypes = getProjectTriggerTypes(project, triggerFilter)
  return Promise.all([
    getScripts(widgetTypes, isPublish, 'widget'),
    getScripts(triggerTypes, isPublish, 'trigger')
  ]).then((res) => {
    return res.flat().filter((res) => res)
  })
}

const executeFun = async function (widget, content) {
  if (widget.clazz === 'widget') {
    const widgetInfo = await isSupportSSR(widget)
    if (widgetInfo.isSupport && widgetInfo.type != 'Video') {
      const funBody = content.replace(/window/gi, 'god')
      try {
        const widget = new Function(funBody)
        widget()
      } catch (error) {
        console.log(error)
      }
    }
  }
}
// 获取各个分组资源的url
const getScriptsUrl = async function (group) {
  if (group.length) {
    return new Promise(async (resolve) => {
      let jsContent = ''
      let pathName = ''
      let requests = group.map((item) => {
        pathName += `${item.scriptName}-`
        return new Promise((_resolve) => {
          request.get(
            'http:' + item.url,
            async function (error, response, body) {
              if (!error && response.statusCode == 200) {
                // 外部组件如果是UI组件。执行一遍代码
                await executeFun(item, body)
                jsContent += body + '\n'
                _resolve(true)
              }
            }
          )
        })
      })
      let res = await Promise.all(requests)
      if (res.length) {
        const lastIndex = pathName.lastIndexOf('-')
        pathName = pathName.substr(0, lastIndex)
        let uploadResult = await uploader.uploadFileContent(
          `${pathName}.js`,
          jsContent
        )
        if (uploadResult.errno == 0) {
          resolve(
            uploadResult.data.file_url_https.replace(
              /(activity\.xueersi\.com)/g,
              'm.xueersi.com'
            )
          )
        }
      }
    })
  }
}

const mergeScripts = async function (scriptMerge) {
  let scriptGroup = getComponentsData(scriptMerge, SCRIPT_NUM, [])
  if (scriptMerge.length) {
    let requests = scriptGroup.map((arr) => {
      return getScriptsUrl(arr)
    })
    let res = await Promise.all(requests)
    return res
  } else {
    return []
  }
}

module.exports = {
  getProjectPreloadScripts,
  getSSRComponentStyle,
  getScripts,
  getProjectTriggerTypes
}
