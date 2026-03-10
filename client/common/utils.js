import { getTriggerConfigByType, loadTriggerConfig } from 'triggers'
import emitter from 'common/event'
import store from 'store/preview'
import stageStore from 'store/stage'
import state from 'store/animation'
import { DOMAIN_WHITE_LIST, WIDGET_EVENT } from './constants'
import * as comMethods from '@k9/x-com'
import startLazyload from 'common/lazyLoad'
import { weChatShare, goToShare } from 'common/share'
import {
  getComputedValue,
  getScaledValue,
  useDataValue
} from 'utils/ModelUtils'
import Layer from 'widgets/Layer'
const xEditorStore = god.xEditor.store
const _WHITE_LIST_ = DOMAIN_WHITE_LIST
import { CLIENT_LIST } from 'common/constants'
import { getProjectOrigin, getThirdPartyConfig } from 'common/thirdParty'
import { getStageConfig } from 'common/config'
import loadScript from 'common/loadScript'
import { getSessionByKey, setSessionData } from 'common/sessionStorage'
/**
 * 通过接口获取基本下拉框的数据
 *
 * @return {Promise}
 */
let getOptionByApi = (method, url, params, callback) => {
  let options
  if (method == 'post') {
    return new Promise((resolve) => {
      comMethods.post(url, params).then((res) => {
        if (res.stat) {
          options = callback(res.data)
          resolve(options)
        }
      })
    })
  } else {
    return new Promise((resolve) => {
      comMethods.get(url, params).then((res) => {
        if (res.stat) {
          options = callback(res.data)
          resolve(options)
        }
      })
    })
  }
}
/**
 * 通过客户端类型格式化客户端默认选中值
 *
 * @return {Array}
 */
let getDefaultClient = (client, type) => {
  let clientConfig = client.concat(CLIENT_LIST) // 客户端的options选型
  if (type == 'client') {
    // 客户端的默认值
    const defaultClient = clientConfig.map((item) => {
      return item.value
    })
    return defaultClient
  }
  return clientConfig
}

/**
 * 通过index判断当前页面是否有back事件
 *
 * @return {boolean}
 */
let checkPageBack = (index) => {
  let project = store.getProject() || stageStore.getStageStore().getProject()
  const backAction = project.pages[index].triggers.filter((trigger) => {
    if (trigger.event == 'back') {
      return true
    }
  })
  const hasBack = !backAction.length ? false : true
  return hasBack
}
/**
 * 通过ID获取当前页面的Index
 *
 * @return {number}
 */
let getPageIndexById = (id) => {
  let project = store.getProject() || stageStore.getStageStore().getProject()
  const index = project.pages.findIndex((page) => {
    return id && page.id == id
  })
  return index
}
/**
 * 通过ID获取当前页面
 *
 * @return {number}
 */
let getPageById = (id) => {
  let project = store.getProject() || stageStore.getStageStore().getProject()
  const pages = project.pages.filter((page) => {
    return id && page.id == id
  })
  return pages.length ? pages[0] : {}
}
/**
 * 判断表单是否有校验成功或者校验失败trigger
 *
 * @return {boolean}
 */
let checkFormValidate = (triggers, type) => {
  // 是否有校验成功或者校验失败trigger
  let hasTriggers = triggers.some((trigger) => {
    if (
      trigger.event == 'validateSuccess' ||
      trigger.event == 'validateFail' ||
      trigger.event == type
    ) {
      return true
    }
    return false
  })
  return hasTriggers
}
/**
 * 获取类型是form的所有表单元素
 *
 * @return {Array}
 */
let getFormWidget = (widgets) => {
  let form = widgets.filter((item) => {
    return item.group == 'Form'
  })
  return form
}

/**
 * 获取元素的事件类型
 *
 * @return {String}
 */
let getWidgetEventName = (key) => {
  let event = WIDGET_EVENT.find((item) => {
    return item.value == key
  })
  let eventName = event ? event.text : '点击'
  return eventName
}

/**
 * 获取客户端
 *
 * @return {string} 客户端名称
 */
let getClient = () => {
  let ua = navigator.userAgent
  const clientList = god.PageData.client || []
  let client = clientList.find((item) => {
    const clientUA = item == 'wx' ? 'MicroMessenger' : item
    let reg = new RegExp(clientUA)
    if (reg.test(ua)) {
      return item
    }
  })
  return client || 'other'
}

let getOnlineUrl = async (url, project, category = god.PageData.category) => {
  let currentUrl = ''
  let jsonUrl = ''
  let res = await getStageConfig('PUBLISH', project.origin)
  if (typeof res.config['URL'] != 'function') {
    // 项目已经发布，并且不存在修改url的方法
    if (!url) {
      currentUrl = `${location.protocol}//${res.config['URL']}/${
        category ? category + '/' : ''
      }${project._id}.html`
      if (project['componentPlat'] && project['componentPlat'] != 'h5') {
        jsonUrl = `${location.protocol}//${res.config['URL']}/${
          category ? category + '/' : ''
        }${project._id.slice(0, 8)}.json`
      }
    } else {
      currentUrl = url.replace(
        /(activity\.xueersi\.com\/oss)/g,
        res.config['URL']
      )
    }
  }
  if (typeof res.config['URL'] == 'function') {
    // 项目已经发布，并且存在修改url的方法
    const targetUrl = url
      ? url
      : `${god.PageData.H5_URL}/${category ? category + '/' : ''}${
          project._id
        }.html`
    currentUrl = res.config['URL'](targetUrl, project, category)
  }
  console.log('currentUrl', currentUrl, res)
  return {
    currentUrl,
    jsonUrl
  }
}

/**
 * 获取平台名称
 *
 * @return {string} 平台名称
 */
let getPlantform = () => {
  let ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) {
    return 'iOS'
  } else if (/android/.test(ua)) {
    return 'android'
  }

  return 'other'
}

// 小程序使用方法
let jumpToH5 = function (url) {
  god.location.href = url
}
/**
 * 是否iPhoneX
 *
 * @return {Boolean} 是否为iphonex
 */
let isIphoneX = function () {
  return (
    /iphone/gi.test(navigator.userAgent) &&
    ((screen.height == 812 && screen.width == 375) ||
      (screen.height == 896 && screen.width == 414))
  )
}

/**
 * 查找组件
 *
 * @param  {Widget} component 组件
 * @param  {string} widgetId  组件id
 * @return {Widget}           组件
 */
let lookupWidget = function (component, widgetId) {
  if (component.id == widgetId) {
    return component
  }
  let target = null
  if (component.hasLayers) {
    // @todo: 优化查找性能
    component.layers.forEach((layer) => {
      let currentWidget = lookupWidget(layer, widgetId)
      if (currentWidget) {
        target = currentWidget
      }
      layer.widgets.forEach((widget) => {
        let currentWidget = lookupWidget(widget, widgetId)
        if (currentWidget) {
          target = currentWidget
        }
      })
    })
  }

  return target
}

/**
 * 根据组件路径获取组件数据
 *
 * @param  {string} widgetId 查找组件ID
 * @return {Object}        组件数据
 */
let getWidgetById = function (widgetId) {
  let project = store.getProject() || stageStore.getStageStore().getProject()
  let result

  project.pages.forEach((page) => {
    let currentWidget = lookupWidget(page, widgetId)
    if (currentWidget) {
      result = currentWidget
    }
    page.widgets.forEach((widget) => {
      let currentWidget = lookupWidget(widget, widgetId)
      if (currentWidget) {
        result = currentWidget
      }
    })
  })
  return result
}
/**
 * 根据组件路径获取组件数据
 *
 * @param  {string} lookup 查找组件路径
 * @return {Object}        组件数据
 */
let getWidget = function (lookup) {
  let project = store.getProject() || stageStore.getStageStore().getProject()
  if (lookup) {
    let selectedIds = lookup.split('-')
    let component = project

    for (let i = 0; i < selectedIds.length; i++) {
      let children = component.pages || component.widgets || component.layers

      children.forEach((child) => {
        if (child.id == selectedIds[i]) {
          component = child
        }
      })
    }

    // 通过visible参数判断是否为组件
    if (component.visible !== undefined) {
      return component
    }
  }

  return null
}
// 在编辑区域使用这个选择值
let getWidgetVariable = function (path = '') {
  let pathArr = path.split('-')
  return pathArr.reduce(function (cur, id) {
    let variableMap = getWidgetById(id).variableMap
    if (variableMap) {
      return variableMap
    } else {
      return cur
    }
  }, {})
}
/**
 * 根据组件路径获取组件数据
 *
 * @param  {string} lookup 查找组件路径
 * @return {Object}        组件数据
 */
let getListenerConfig = function (lookup, listenerName) {
  let currentWidget = getWidget(lookup)
  let result
  if (currentWidget && currentWidget.listeners) {
    Object.keys(currentWidget.listeners).forEach((key) => {
      if (key === listenerName) {
        result = Object.assign({}, currentWidget.listeners[key].config)
      }
    })
  }
  return result
}

/**
 * 根据组件路径获取组件数据
 *
 * @param  {string} lookup 查找组件路径
 * @return {Object}        组件数据
 */
let getListener = function (lookup) {
  let temp = lookup.split('-')
  let path = `${temp[0]}-${temp[1]}`
  let currentWidget = getWidget(path)
  let result
  if (currentWidget && currentWidget.listeners) {
    Object.keys(currentWidget.listeners).forEach((key) => {
      if (key === temp[2]) {
        result = currentWidget.listeners[key]
      }
    })
  }
  return result
}

/**
 * 触发事件
 */
let emmit = function (options, next) {
  if (typeof options == 'string') {
    runTriggers(this.widget.triggers, options, 'widget', {}, this.widget)
  } else {
    const { listener, data } = options
    emitter.emit(listener, data, next, listener)
  }
}

/**
 * 再次封装交互日志
 */
let sendClickLog = function (options) {
  let element = this.element ? this.element : this.widget
  let widgetOptions = {}
  // 自定义UI组件交互日志增加 widgettype字段
  if (this.widget && this.widget.category == 'widget') {
    widgetOptions = {
      widgettype: this.widget.type || '',
      widgetversion: this.widget.version || ''
    }
  }
  // 如果用户自定义字段中有elementname/elementid，则被覆盖掉
  comMethods.sendClickLog(
    Object.assign(
      {
        action: '点击'
      },
      options,
      {
        elementname: element.name,
        elementid: element.id,
        ...widgetOptions
      }
    )
  )
}
let setShareConfig = function (options = {}) {
  if (Object.keys(options).length <= 0) return
  if (!store.getProject()) {
    const ProjectData = PageData.project
    store.initProject(ProjectData)
  }
  store.modifyShareConfig(options)
  weChatShare()
}
/**
 * 准备上下文
 *
 * @return {Object}         上下文对象
 */

let context = function (options = {}) {
  let publicMethods = {}
  Object.keys(comMethods).filter((key) => {
    if (key[0] != '_') {
      // 如果是私有方法，删除
      publicMethods[key] = comMethods[key]
    }
  })
  return Object.assign(
    {
      // prettier-ignore
      project: store.getProject() || (stageStore.getStageStore() && stageStore.getStageStore().getProject()),
      inEditor: god.inEditor,
      emmit,
      xEditorStore,
      components: { Layer },
      jumpToH5,
      runAction,
      startLazyload,
      getWidget,
      getListener,
      getClient,
      getPlantform,
      getComputedValue,
      getPageDataByKey: store.getPageDataByKey,
      setPageData: store.setPageData,
      checkFormValidate,
      getFormWidget,
      emitter,
      goToShare,
      weChatShare,
      localStorage,
      getScaledValue,
      useDataValue,
      getProjectOrigin,
      getThirdPartyConfig,
      getSessionByKey,
      setSessionData,
      frezzPage,
      setShareConfig
    },
    publicMethods,
    options,
    { sendClickLog, loadScript }
  )
}

/**
 * 执行动画
 *
 * @param  {Array}  triggers 触发器列表
 * @param  {string} event    事件名称
 * @param  {string} type     类型
 */

let runAnimate = (animations, index, id, event) => {
  if (index < animations.length) {
    let animation = animations[index]
    return new Promise((resolve) => {
      let time = 0
      if (animation.scene == event) {
        time = animation.delay + animation.duration * animation.loop
        state.animation.widgetId = id
        state.animation['widget' + id] = animation
      }
      setTimeout(() => {
        resolve(runAnimate(animations, ++index, id, event))
      }, time)
    })
  }
}
let removeAnimate = (id) => {
  state.animation.widgetId = null
  state.animation['widget' + id] = {}
}
let setFrezzPageFlag = false
function disable() {
  if (setFrezzPageFlag) {
    return
  }
  const offsetTop =
    document.documentElement.scrollTop || document.body.scrollTop
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.position = 'fixed'
  document.documentElement.style.top = -offsetTop + 'px'
  setFrezzPageFlag = true
}

function enable() {
  setFrezzPageFlag = false
  const offsetTop = -parseFloat(document.documentElement.style.top) || 0
  document.documentElement.style.overflow = 'visible'
  document.documentElement.style.position = 'static'
  document.documentElement.scrollTop = document.body.scrollTop = offsetTop
}

export function frezzPage(flag) {
  if (flag) {
    // 冻结
    disable()
    return
  }
  enable()
}
let AnimateChangeVisible = (widget, visible) => {
  let scene = visible == true ? 'In' : 'Out'
  let animations = widget.animations.filter(
    (animation) => animation.scene == scene
  )
  let hasAnimate = animations.length ? true : false
  // 停掉之前的动画
  if (hasAnimate) {
    if (visible) {
      widget.visible = true
    }
    removeAnimate(widget.id)
    runAnimate(animations, 0, widget.id, scene)
  } else {
    widget.visible = visible
  }
}

let COUNT_MAP = {}
let getCount = (event, uid) => {
  COUNT_MAP[event + '_' + uid] = COUNT_MAP[event + '_' + uid] || 0
  return ++COUNT_MAP[event + '_' + uid]
}

/**
 * 执行触发器的嵌套行为
 * @param  {Object}    trigger     触发器
 */
let runAction = async (trigger, oldctx = {}) => {
  let result
  let next = function (res) {
    result = res
  }
  // 上下文
  let ctx = context(Object.assign({}, oldctx, { trigger }))
  // 执行方法
  let triggerConfig = getTriggerConfigByType(trigger.type, trigger.version)
  if (trigger.version) {
    triggerConfig = await loadTriggerConfig({
      type: trigger.type,
      version: trigger.version
    })
  }
  // run默认值
  let run = function (ctx, next) {
    next()
  }
  if (triggerConfig) {
    run = triggerConfig.run
  }
  await run.call(trigger, ctx, next)
  return result
}

/**
 * 执行触发器
 *
 * @param  {Array}    triggers          触发器列表
 * @param  {string}   event             事件名称
 * @param  {string}   type              类型
 * @param  {Object}   [options]           Options
 * @param  {Function} [options.dispatch]  Function that dispatch an action
 * @param  {string}  uid  当前trigger的唯一标示
 */
let runTriggers = (
  triggers,
  event,
  type,
  options = {},
  element,
  variableMap
) => {
  if (type == 'widget') {
    options = {
      widgetType: element.type,
      widgetVersion: element.version || ''
    }
  } else {
    options = {
      widgetType: 'page'
    }
  }

  let currentCount = getCount(event, element.id)
  let tasks = []
  /**
   * 执行下一个
   *
   * @return {Function} [description]
   */
  let next = function () {
    if (tasks.length) {
      let task = tasks.shift()
      try {
        task()
      } catch (e) {
        console.error(e)
      }
    }
  }
  // 触发器排序，将SendLog 等有优先级字段的触发器排在前面排在前面
  const _sortedTriggers = triggers.slice().sort((prev, next) => {
    let prevConfig = getTriggerConfigByType(prev.type, prev.version)
    let nextConfig = getTriggerConfigByType(next.type, next.version)
    let prevPriority = 0
    let nextPriority = 0

    if (prevConfig) {
      prevPriority = prevConfig.priority || 0
    }

    if (nextConfig) {
      nextPriority = nextConfig.priority || 0
    }

    return nextPriority - prevPriority
  })
  let platform = getPlantform()
  let client = getClient()
  // 遍历触发器，查找到满足事件、客户端要求的触发器
  _sortedTriggers.forEach((trigger) => {
    // fix me trigger platform array
    let platformArray = trigger.platform
    let clientArray = trigger.client
    // 没填event的情况，增加默认值
    if (!trigger.event) {
      if (type == 'project') {
        trigger.event = 'load'
      } else if (type == 'page') {
        trigger.event = 'enter'
      } else if (type == 'widget') {
        trigger.event = 'click'
      }
    }
    if (
      trigger.event == event &&
      platformArray.indexOf(platform) > -1 &&
      clientArray.indexOf(client) > -1
    ) {
      // 上下文
      let ctx = context({
        event,
        trigger,
        element,
        variableMap,
        page: getPageById(element.path.split('-')[0]),
        ...options
      })
      // 执行方法
      let triggerConfig = getTriggerConfigByType(trigger.type, trigger.version)
      // run默认值
      let run = function (ctx, next) {
        next()
      }
      if (triggerConfig) {
        run = triggerConfig.run
      } else {
        // 说明是外置的
        let triggerType = `${trigger.type}-${trigger.version}`
        let triggerNS = god.__components__

        try {
          if (triggerNS && triggerNS[triggerType]) {
            run = triggerNS[triggerType].run
          }
        } catch (e) {
          console.error(e)
        }
      }
      let fn = run.bind(trigger, ctx, next)
      if (!trigger.showCount) {
        tasks.push(fn)
      }
      if (trigger.showCount && trigger.count && trigger.count == currentCount) {
        // 如果事件有次数限制
        tasks.push(fn)
      }
    }
  })

  next()
}

/**
 * 判断是input否有焦点
 * @return {Boolean} 结果
 */
let hasInputFocus = () => {
  if (
    document.activeElement &&
    (document.activeElement.tagName == 'INPUT' ||
      document.activeElement.tagName == 'TEXTAREA' ||
      document.activeElement.getAttribute('contenteditable'))
  ) {
    return true
  }
  return false
}

/**
 * query转数据
 *
 * @param {string} query
 * @return {Object}
 */
let query2json = (query) => {
  let result = {}
  let pairs = query.replace(/^\?/, '').split('&')

  pairs.forEach(function (pair) {
    pair.replace(/(.*?)=(.*)/, function (match, key, value) {
      result[key] = decodeURIComponent(value)
    })
  })

  return result
}

let checkWhiteList = (str) => {
  let list = _WHITE_LIST_
  // 白名单为空, 直接通过，方便线下测试
  if (!list || list.length == 0) {
    return true
  }

  // 非贪婪匹配，匹配到斜杠即可，资源一定有/，括号最后一个匹配就是
  let regDomain = /^(http(s)?:)?\/\/(.+?)\//

  for (let i = 0; i < list.length; i++) {
    let item = list[i]
    let matches = String(str).match(regDomain)

    if (!matches) {
      continue
    }

    let inputDomain = matches[matches.length - 1]
    if (inputDomain.indexOf(item) != -1) {
      return true
    }
  }
  return false
}

let EventMap = {}
function getHeight(ele) {
  let max = ele.offsetTop + ele.offsetHeight

  if (ele.children && ele.children.length) {
    ;[].slice.call(ele.children).forEach((child) => {
      max = Math.max(
        max,
        (child.offsetParent == ele ? ele.offsetTop : 0) + getHeight(child)
      )
    })
  }

  return max
}

function setEventCallBack(event, fn) {
  EventMap[event] = EventMap[event] || []
  // 过滤下是否已经存在
  EventMap[event].push(fn)
}

function getEventCallBack(event) {
  return EventMap[event] || []
}

function getNewWidgetName(list, type, name) {
  let counts = [0]
  list.forEach((widget) => {
    if (widget.type == type) {
      widget.name.replace(new RegExp(name + '-(\\d+)'), (match, count) => {
        counts.push(+count)
      })
    }
  })
  return name + '-' + (Math.max.apply(null, counts) + 1)
}

let localStorage = {
  getItem: function (att) {
    if (god) {
      return god.localStorage.getItem(att)
    }
  },
  setItem: function (att, value) {
    if (god) {
      return god.localStorage.setItem(att, value)
    }
  }
}

function handerRuleUrl(remoteUrl, ruleId, env) {
  if (remoteUrl) {
    const url = new URL(remoteUrl)
    url.searchParams.set('ruleId', ruleId)
    if (env) {
      url.searchParams.set('type', env)
    }
    return url.href
  }
}

export function ssrRender(project, container) {
  return !(
    project &&
    project.useData &&
    container.dataBox &&
    container.dataBox.dataOrigin == 'request' &&
    container.dataBox.requestUrl
  )
}

let validateRoleLimit = (key) => {
  let permissionList = window.PageData.userInfo.permissionList
  if (key instanceof Array) {
    key.every((k) => permissionList[k].value == 1)
  } else {
    return permissionList[key]?.value == 1
  }
}

let getWidgetRole = (type) => {
  const common = validateRoleLimit(
    type === 'UIWidget' ? 'editorUIWidgetCommon' : 'editorTriggerWidgetCommon'
  )
  const custom = validateRoleLimit(
    type === 'UIWidget' ? 'editorUIWidgetCustom' : 'editorTriggerWidgetCustom'
  )
  const all = common && custom
  let selectedType = 'all'
  if (!all && common) {
    selectedType = 'common'
  } else if (!all && custom) {
    selectedType = 'custom'
  } else if (!all) {
    selectedType = 'no'
  }
  return { selectedType, showTagTitle: all }
}

export {
  getClient,
  isIphoneX,
  getPlantform,
  runTriggers,
  runAnimate,
  hasInputFocus,
  query2json,
  getWidget,
  getWidgetById,
  checkWhiteList,
  getOnlineUrl,
  setEventCallBack,
  getEventCallBack,
  context,
  runAction,
  xEditorStore,
  getHeight,
  checkPageBack,
  getPageIndexById,
  getFormWidget,
  checkFormValidate,
  getListenerConfig,
  getListener,
  AnimateChangeVisible,
  getWidgetEventName,
  getNewWidgetName,
  goToShare,
  weChatShare,
  getOptionByApi,
  localStorage,
  getWidgetVariable,
  getPageById,
  getDefaultClient,
  handerRuleUrl,
  validateRoleLimit,
  getWidgetRole
}
