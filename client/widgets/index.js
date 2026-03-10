import { observable } from 'mobx'
import loadScript from 'common/loadScript'
import loadStyle from 'common/loadStyle'
import { memoize } from 'lodash'
import { STATIC_URL } from 'common/constants'

// 所有组件
import RichText from './RichText'
import NormalText from './NormalText'
import Image from './Image'
import Container from './Container'
import DataContainer from './DataContainer'

import { getWidgetInfo } from 'apis/WidgetAPI'

const BuiltInWidgets = [
  RichText,
  NormalText,
  Image,
  DataContainer,
  Container
].map((BuildInWidget) => {
  BuildInWidget.isLoaded = true
  return BuildInWidget
})

const installedWidgets = {}

const innerWidgets = PageData.innerWidgets || {} // 内部组件
for (let key in innerWidgets) {
  installedWidgets[key] = innerWidgets[key]
}

const installed = PageData.installed || {} // 外部组件 用户已安装的外部组件，永远是最新版本
for (let key in installed) {
  // 用户已安装的外部组件，永远是最新版本
  if (installed[key].category == 'widget') {
    // 区分是行为组件还是UI组件
    installedWidgets[key] = installed[key]
  }
}

const CustomWidgets = Object.values(installedWidgets)
// god.__components__ 当前页面加载的js组件
god.__components__ = god.__components__ || {}
for (let componentName in god.__components__) {
  let component = god.__components__[componentName]
  if (component.category == 'widget') {
    if (installedWidgets[component.type]) {
      Object.assign(installedWidgets[component.type], component, {
        isLoaded: true
      })
    } else {
      CustomWidgets.push(component)
    }
  }
}

// 所有组件都在这里~ (内建的（widgets目录下的） + 内部的（Button和HotArea） + 外部（贡献的）)
const WidgetConfigs = observable(BuiltInWidgets.concat(CustomWidgets))
console.log(WidgetConfigs, 'WidgetConfigs')

/**
 * 根据类型获取组件配置
 *
 * @param  {string} type 类型
 * @return {Object}      组件配置
 */
const getWidgetConfigByType = (type, version) => {
  let currentWidgetConfig = null
  for (let i = 0; i < WidgetConfigs.length; i++) {
    if (type == WidgetConfigs[i].type) {
      // 模板之间的同一组件版本不一致时会有问题
      if (version) {
        // 外部组件
        if (version == WidgetConfigs[i].version) {
          currentWidgetConfig = WidgetConfigs[i]
          break
        }
      } else {
        // 基础组件
        currentWidgetConfig = WidgetConfigs[i]
        break
      }
    }
  }
  return currentWidgetConfig
}

// 下面memoize缓存函数默认用第一个参数做标识
let proxyGetWidgetInfo = (widgetFlag, widgetInfo) => {
  const { version, type } = widgetInfo
  return getWidgetInfo(type, version)
}
// 缓存 getWidgetInfo 结果
let getWidgetInfoCache = memoize(proxyGetWidgetInfo)

let isWidgetSupportSSR = async (type, version) => {
  // 不是编辑区或者预览的情况，直接不需加载，此时走的ssr
  if (!(god.inEditor || /project\/preview/.test(location.href))) return false
  const xcliSupportSSRVersion = 0
  const widgetInfo = {
    type,
    version
  }
  const widgetFlag = `${type}-${version}`

  // 下面memoize缓存函数默认用第一个参数做标识
  const widget = await getWidgetInfoCache(widgetFlag, widgetInfo)
  return (
    widget.info &&
    widget.info.xcli &&
    parseInt(widget.info.xcli.split('.').join('')) >= xcliSupportSSRVersion
  )
}

let getWidgetStyle = async (widgetConfig) => {
  // client端 加载外部组件js
  if (typeof window !== 'undefined') {
    const { type, version } = widgetConfig
    const isInEditorAndSupportSSR = await isWidgetSupportSSR(type, version)
    if (isInEditorAndSupportSSR) {
      let styleLink = `${STATIC_URL}/components/${type}/${version}/index.css`
      return loadStyle(styleLink)
    }
    return null
  }
}

/**
 * 加载组件配置
 *
 * @return {Promise} promise
 */
let loadWidgetConfig = async (widgetConfig) => {
  let componentsFlag = widgetConfig.type + '-' + widgetConfig.version
  const { type, version } = widgetConfig
  let scriptUrl = `${STATIC_URL}/components/${type}/${version}/index.js`
  return new Promise((resolve) => {
    loadScript(scriptUrl).then(async function () {
      // 第一次安装的组件在WidgetConfigs中不存在
      let WidgetConfig = getWidgetConfigByType(
        widgetConfig.type,
        widgetConfig.version
      )
      WidgetConfig = Object.assign(
        WidgetConfig || {},
        god.__components__[componentsFlag],
        {
          version: widgetConfig.version,
          isLoaded: true
        }
      )
      await getWidgetStyle(widgetConfig)
      installWidget(WidgetConfig)
      resolve(WidgetConfig)
    })
  })
}

/**
 * 是否内建组件
 *
 * @return {Boolean} 是否拥有组件的高度
 */
let hasHeightWidget = (widget) => {
  // TODO: NormalText 的逻辑需要再梳理，需要考量，编辑态、发布台、是否设置了autoHeight、lineHeight
  if (widget.type === 'NormalText') {
    if (!widget.data.autoHeight) {
      return true
    }
  }
  if (['Button', 'Input', 'TextArea', 'Submit'].indexOf(widget.type) > -1) {
    return true
  }
  return false
}

let installWidget = (WidgetConfig) => {
  let currentWidgetConfig = getWidgetConfigByType(
    WidgetConfig.type,
    WidgetConfig.version
  )
  if (!currentWidgetConfig) {
    WidgetConfigs.push(WidgetConfig)
    installedWidgets[WidgetConfig.type] = WidgetConfig
  } else {
    if (!currentWidgetConfig.onRender) {
      WidgetConfigs.remove(currentWidgetConfig)
      WidgetConfigs.push(WidgetConfig)
      installedWidgets[WidgetConfig.type] = WidgetConfig
    }
  }
}

let uninstallWidget = (WidgetConfig) => {
  WidgetConfig = getWidgetConfigByType(WidgetConfig.type, WidgetConfig.version)
  if (WidgetConfig) {
    WidgetConfigs.remove(WidgetConfig)
    delete installedWidgets[WidgetConfig.type]
  }
}

export {
  WidgetConfigs,
  getWidgetConfigByType,
  hasHeightWidget,
  loadWidgetConfig,
  installWidget,
  uninstallWidget,
  installedWidgets
}
