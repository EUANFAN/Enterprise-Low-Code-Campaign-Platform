/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-03-28 21:15:27
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-03-01 10:56:42
 */
const app = global.app
const { config } = app
const appConfig = config.get('app')

/**
 * 获取协议
 *
 * @return {string} 协议
 */
function getProtocal() {
  let protocal = 'https:'
  if (app.env == 'dev') {
    protocal = 'http:'
  }
  return protocal
}

/**
 * 获取基础url
 *
 * @return {string} 基础url
 */
function getBaseUrl(needProtocal, doubleProtocal, isResource) {
  let protocal = getProtocal()
  let host = isResource ? appConfig.resourceHost : appConfig.host
  let path = isResource ? appConfig.resourcePath : appConfig.path
  if (needProtocal === false) {
    return `${host}${path}`
  }
  if (doubleProtocal) {
    return `//${host}${path}`
  }
  return `${protocal}//${host}${path}`
}

/**
 * 获取其他域url
 *
 * @return {string} 基础url
 */
function otherBaseUrl(type, value) {
  let protocal = getProtocal()
  let host = appConfig.host
  if (type && value) {
    host =
      (appConfig.otherHost[type] && appConfig.otherHost[type][value]) ||
      appConfig.host
  }
  let path = appConfig.path
  return `${protocal}//${host}${path}`
}

/**
 * 获取online url
 *
 * @param  {string} id id
 * @return {string}    url
 */
function onlineUrl(id, revisionData, needProtocal, env = '') {
  let htmlUrl
  if (env == 'online_test') {
    env = '/_online_test_'
  }
  htmlUrl = `${getBaseUrl(needProtocal)}${env}/${id}.html`
  return htmlUrl
}

function componentUrl(componentName, componentVersion) {
  return `${getBaseUrl(
    true,
    true,
    true
  )}/components/${componentName}/${componentVersion}/index.js`
}

function icoUrl() {
  return {
    editor: `${getBaseUrl(true, true)}/tiangong.ico`,
    xueersi: `${getBaseUrl(true, true)}/favicon.ico`,
    xiwang: `${getBaseUrl(true, true)}/xiwang.ico`,
    vipx: `${getBaseUrl(true, true)}/gaozhong.ico`
  }
}

const editUrl = function (projectId) {
  let endpoint = config.get('app').endpoint
  return `${endpoint}/editor/${projectId}`
}

const editRuleUrl = function (ruleId) {
  let endpoint = config.get('app').endpoint
  return `${endpoint}/customRule/${ruleId}`
}

const dataUrl = function (projectId) {
  let endpoint = config.get('app').endpoint
  return `${endpoint}/data/${projectId}`
}

const previewUrl = function (projectId, pageIndex, log_id, isTheme) {
  let endpoint = config.get('app').endpoint
  return (
    `${endpoint}/project/preview?${
      log_id ? 'log_id=' + log_id + '&' : ''
    }id=${projectId}` +
    (pageIndex !== undefined ? `&current_page=${pageIndex}` : '') +
    (isTheme ? '&isTheme=true' : '')
  )
}

module.exports = {
  onlineUrl,
  componentUrl,
  icoUrl,
  editUrl,
  dataUrl,
  previewUrl,
  editRuleUrl,
  otherBaseUrl,
  H5_URL: getBaseUrl(true, false),
  STATIC_URL: getBaseUrl(true, true, true)
}
