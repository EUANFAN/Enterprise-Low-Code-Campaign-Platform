import { observable } from 'mobx'
import loadScript from 'common/loadScript'
import { STATIC_URL } from 'common/constants'
import ChangeWidget from './ChangeWidget'
import SendLog from './SendLog'
import Redirect from './Redirect'
import ScrollToPage from './ScrollToPage'
import Toast from './Toast'
import appShare from './appShare' // appshare不能删掉，在share行为的时候判断如果是客户端，调用该appshare
import AddShare from './AddShare'
import Alert from './Alert'

const BuildInTriggers = [
  ChangeWidget,
  Redirect,
  ScrollToPage,
  Toast,
  SendLog,
  appShare,
  AddShare,
  Alert
].map((trigger) => {
  trigger.isLoaded = true
  return trigger
})

let installed = god.PageData.installed || {}
let installedTriggers = {}
for (let key in installed) {
  if (installed[key].category == 'action') {
    installedTriggers[key] = installed[key]
  }
}

let CustomTriggers = Object.values(installedTriggers)

// 只有发布后页面走此逻辑
god.__components__ = god.__components__ || {}
for (let componentName in god.__components__) {
  let component = god.__components__[componentName]
  if (component.category == 'action') {
    if (installedTriggers[component.type]) {
      Object.assign(installedTriggers[component.type], component, {
        isLoaded: true
      })
    } else {
      CustomTriggers.push(component)
    }
  }
}

/**
 * 行为配置
 *
 * @type  {string} Object 行为类型列表
 */
let TriggerConfigs = observable(BuildInTriggers.concat(CustomTriggers))
/**
 * 获取行为配置
 * @param  {string} type 行为类型
 * @return {Object}      行为配置
 */
let getTriggerConfigByType = (type, version) => {
  let currentTriggerConfig = null
  for (let i = 0; i < TriggerConfigs.length; i++) {
    if (type == TriggerConfigs[i].type) {
      // 模板之间的同一组件版本不一致时会有问题
      if (version) {
        // 外部组件
        if (version == TriggerConfigs[i].version) {
          currentTriggerConfig = TriggerConfigs[i]
          break
        }
      } else {
        // 基础组件
        currentTriggerConfig = TriggerConfigs[i]
        break
      }
    }
  }
  return currentTriggerConfig
}

/**
 * 加载组件配置
 * @return {Promise} promise
 */
let loadTriggerConfig = (triggerConfig) => {
  let url = `${STATIC_URL}/components/${triggerConfig.type}/${triggerConfig.version}/index.js`

  return new Promise((resolve) => {
    loadScript(url).then(function () {
      let TriggerConfig =
        getTriggerConfigByType(triggerConfig.type, triggerConfig.version) || {}
      Object.assign(
        TriggerConfig,
        god.__components__[`${triggerConfig.type}-${triggerConfig.version}`],
        {
          version: triggerConfig.version,
          loaded: true
        }
      )
      installTrigger(TriggerConfig)
      resolve(TriggerConfig)
    })
  })
}

let installTrigger = (TriggerConfig) => {
  if (!getTriggerConfigByType(TriggerConfig.type, TriggerConfig.version)) {
    TriggerConfigs.push(TriggerConfig)
    installedTriggers[TriggerConfig.type] = TriggerConfig
  }
}

let uninstallTrigger = (TriggerConfig) => {
  TriggerConfig = getTriggerConfigByType(
    TriggerConfig.type,
    TriggerConfig.version
  )
  if (TriggerConfig) {
    TriggerConfigs.remove(TriggerConfig)
    delete installedTriggers[TriggerConfig.type]
  }
}

let getUsedTriggerVersion = (type) => {
  let currentTriggerConfig = null
  for (let i = 0; i < TriggerConfigs.length; i++) {
    if (type == TriggerConfigs[i].type) {
      currentTriggerConfig = TriggerConfigs[i]
      break
    }
  }
  return (currentTriggerConfig || {}).version
}

export {
  TriggerConfigs,
  getTriggerConfigByType,
  loadTriggerConfig,
  installTrigger,
  uninstallTrigger,
  installedTriggers,
  getUsedTriggerVersion
}
