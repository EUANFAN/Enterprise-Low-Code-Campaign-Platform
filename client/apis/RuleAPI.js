import { fetchJSON } from './BaseAPI'
import { post } from '@k9/x-com'
const md5 = require('md5')
import moment from 'moment'

// 生成签名 md5(sGroupId + ”-“ + ruleId + "-" + ADY3110 + "-" + 日期（2020-01-01)
function getSign(sGroupId, ruleId) {
  return md5(`${sGroupId}-${ruleId}-ADY3110-${moment().format('YYYY-MM-DD')}`)
}
const baseUrl =
  process.env.NODE_ENV === 'dev' ? 'http://editor-dev.xiwang.com:8077/' : '/'
export async function createRule({
  name,
  ruleWidget,
  remoteUrl,
  origin,
  isThemeRule,
  business,
  tags
}) {
  return fetchJSON('/api/rule/createRule', {
    method: 'post',
    name,
    ruleWidget,
    remoteUrl,
    origin,
    isThemeRule,
    business,
    tags
  })
}

/**
 * 更新规则组件信息
 * @param {Object} optionsData - 规则组件信息
 * @param {number} optionsData.id - 规则组件id
 * @param {Object} optionsData.ruleData - 规则组件数据
 * @param {Object} optionsData.ruleWidget - 规则组件信息
 * @param {string} optionsData.ruleWidget.type - 规则组件名字
 * @param {string} optionsData.ruleWidget.version - 规则组件版本
 * @param {string} optionsData.action - 动作
 * @returns {Promise}
 */
export async function updateRule(optionsData) {
  const { id, ruleData, action = 'update', ruleWidget } = optionsData
  console.log('🚀 ~ JSON.stringify(ruleData)', JSON.stringify(ruleData))
  const reqData = {
    method: 'post',
    ruleData: JSON.stringify(ruleData),
    action,
    ruleWidget
  }

  return fetchJSON(`/api/rule/updateRule/${id}`, reqData)
}

export async function createRuleByTheme({ name, themeId, themeRuleId, tags }) {
  return fetchJSON('/api/rule/createRuleByTheme', {
    method: 'post',
    name,
    themeRuleId,
    themeId,
    tags
  })
}

export async function ruleBindThme({ themeId, ruleId }) {
  return fetchJSON(`/api/rule/ruleBindThme/${ruleId}`, {
    method: 'post',
    themeId
  })
}

export async function getThemeRuleVersion(themeId) {
  return fetchJSON(`/api/rule/getThemeRuleVersion/${themeId}`, {
    method: 'get'
  })
}

export async function getRuleConfig(ruleId) {
  return fetchJSON('/api/rule/getRule', {
    method: 'get',
    ruleId
  })
}

/**
 * 设置规则组件规则
 * @param {Object} options - 请求参数
 * @param {string} options.activityName - 活动名字[规则名字]
 * @param {number} options.member - 规则项目的拥有者
 * @param {number} options.sGroupId - 活动id
 * @param {number} options.ruleId - 规则项目的id
 * @param {string} options.config - 规则项目数据配置
 * @param {string} options.publicConfig - 公共配置数据
 * @param {string} options.type - 环境标识
 * @param {string} options.business - 项目类型
 * @returns {Promise}
 */
export async function setConfigData(options) {
  let { ruleId, type } = options
  let newsGroupId = 0
  // 先去后端的get接口里面找一次，如果后端接口有sGroupId，用后端接口提供的，若后端接口没有，则用默认的0，让后端接口去生成
  let res = await getRuleData(type, ruleId)

  if (res.code === 0) {
    const { sGroupId } = res.data
    newsGroupId = sGroupId || 0
  } else if (res.code === 1001) {
    newsGroupId = 0
  } else {
    console.log('error:', res)
    return
  }

  const sign = getSign(newsGroupId, ruleId)

  options['sign'] = sign
  options['productId'] = ruleId
  options['sGroupId'] = newsGroupId
  options['business'] = options['business'] ? options['business'] : 'clientView'

  const AddConfigUrl = `${BASE_REQ_URL}/activity/editor/draw/config/create`
  return post(AddConfigUrl, { ...options })
}

export function publishConfig(ruleId, member) {
  const sign = getSign('000000', ruleId)
  return post(
    'https://booster.xueersi.com/h5EditStationAdmin/ConfigCollection/PublishConfig',
    {
      ruleId,
      member,
      productId: ruleId,
      sign,
      sGroupId: '000000'
    }
  )
}

/**
 * 获取业务类型
 * @returns {Promise}
 */
export function getBusinessType() {
  const sign = getSign('000000', '000000')
  const reqUrl =
    'https://booster.xueersi.com/h5EditStationAdmin/ConfigCollection/GetBusinessType'
  const reqData = { sign, sGroupId: '000000', productId: '000000' }
  return post(reqUrl, reqData)
}

/**
 * 获取规则组件数据.
 * @param {string} type 环境类型
 * @param {string} ruleId 规则id,为规则组件项目的[_id]
 * @returns {Promise}
 */
export async function getRuleData(type, ruleId) {
  // const GetConfigUrl =
  //   'https://booster.xueersi.com/h5EditStation/ConfigCollection/GetConfig'
  const GetConfigUrl = `${BASE_REQ_URL}/activity/editor/draw/config/get`

  return post(GetConfigUrl, { type, ruleId })
}

export async function mountRule(data = {}) {
  return fetchJSON(`${baseUrl}monster/widget/publish`, {
    method: 'post',
    ...data
  })
}

export const loadFileContent = ((cache = {}) =>
  async function (data = {}) {
    const params = Object.assign({ accessToken: '15t4x9FtKv4T928x_Yoy' }, data)
    const path = JSON.stringify(params)
    if (cache[path]) {
      return cache[path]
    }
    return fetchJSON(`${baseUrl}monster/3rd/getGitlabFileList`, {
      method: 'get',
      ...params
    }).then((data) => {
      cache[path] = data
      return data
    })
  })()
