import { fetchJSON } from './BaseAPI'
const API_PREFIX = '/api/themes'
import { compareData } from 'common/comparePageData'
import { toJS } from 'mobx'
import qs from 'query-string'
import { getStageConfig } from 'common/config'
import { getDefaultClient } from 'common/utils'

export function getThemes(groupId = '', currentPage = 0, pageSize = 20) {
  return fetchJSON(`${API_PREFIX}/${groupId}`, {
    pageSize,
    currentPage
  })
}

export function getThemesByThemeGroup(
  themeGroupId,
  currentPage = 0,
  pageSize = 10,
  showData = false,
  search = '',
  home = 0,
  auditStatus
) {
  return fetchJSON(`${API_PREFIX}/`, {
    themeGroup: themeGroupId,
    pageSize,
    currentPage,
    search,
    showData,
    home,
    auditStatus
  })
}

// WARNING 因为现在并没有实作主题套用计算，所以目前无法真正统计热门主题。目前先以最新发布主题为主
export function getPopularThemes(
  currentPage = 0,
  pageSize = 10,
  search = '',
  auditStatus = '',
  themeGroup = ''
) {
  return fetchJSON(`${API_PREFIX}`, {
    popular: 1,
    currentPage,
    pageSize,
    search,
    auditStatus,
    themeGroup
  })
}

export function getThemeGroups(
  category,
  currentPage = 0,
  pageSize = 10,
  search = '',
  userDeptId
) {
  return fetchJSON(`${API_PREFIX}/categories/${category}`, {
    userDeptId,
    currentPage,
    pageSize,
    search
  })
}

export function createThemeGroup(name, category, userDeptId) {
  return fetchJSON(`${API_PREFIX}/categories/${category}`, {
    method: 'post',
    name,
    userDeptId
  })
}

export function createThemeCategory(name, key, reviewerIds, userDeptId) {
  return fetchJSON(`${API_PREFIX}/theme-category`, {
    method: 'post',
    name,
    reviewerIds,
    key,
    category: 'theme',
    userDeptId: userDeptId
  })
}
export async function createThemeInGroup({
  name,
  layout,
  groupId,
  themeType,
  pageData,
  application,
  userDeptId,
  componentPlat,
  ruleId,
  miniProgramId
}) {
  let res = await getStageConfig('EDITOR')
  const client = getDefaultClient(res.config['ClIENT'], 'client')
  const queryUrl = qs.parseUrl(god.location.href)
  let obj = {}
  if (pageData) {
    const { rulesConfig } = pageData
    obj = rulesConfig ? { rulesConfig: {} } : {}
  }
  // 过滤项目的rulesConfig配置
  const newPageData = Object.assign({}, pageData, obj)
  let options = Object.assign(
    {
      method: 'post',
      name,
      layout,
      themeType,
      userDeptId: userDeptId ? userDeptId : queryUrl.query.userDeptId,
      client,
      application,
      componentPlat,
      ruleId,
      miniProgramId
    },
    pageData
      ? {
          pageData: JSON.stringify(await compareData(toJS(newPageData)))
        }
      : {}
  )
  return fetchJSON(`${API_PREFIX}/theme-groups/${groupId}`, options)
}

export function deleteTheme(themeId) {
  const queryUrl = qs.parseUrl(god.location.href)
  return fetchJSON(`${API_PREFIX}/${themeId}`, {
    method: 'delete',
    userDeptId: queryUrl.query.userDeptId
  })
}

export function deleteThemeGroup(themeGroupId) {
  const queryUrl = qs.parseUrl(god.location.href)
  return fetchJSON(`${API_PREFIX}/theme-groups/${themeGroupId}`, {
    method: 'delete',
    userDeptId: queryUrl.query.userDeptId
  })
}

export function deleteCategory(categoryId) {
  return fetchJSON(`${API_PREFIX}/theme-category/${categoryId}`, {
    method: 'delete'
  })
}

// 目前只接受修改name，新增提交其他字段修改的话，需要更改 server 的 VALID_BODY_PARAMS array
export function updateThemeGroup(groupId, options = {}) {
  const queryUrl = qs.parseUrl(god.location.href)
  return fetchJSON(`${API_PREFIX}/theme-groups/${groupId}`, {
    method: 'put',
    userDeptId: queryUrl.query.userDeptId,
    ...options
  })
}

// 模板名称
export function updateCategory(category, options = {}) {
  return fetchJSON(`${API_PREFIX}/theme-category/${category}`, {
    method: 'put',
    ...options
  })
}
// 提交审核
export function submitAudit(themeId, options) {
  return fetchJSON('/audit/commit', {
    method: 'post',
    themeId,
    ...options
  })
}

// 更新审核状态
export function updateAuditStatus(themeId, options) {
  const reqData = { method: 'post', themeId, ...options }
  return fetchJSON('/audit/updateThemeAudit', reqData)
}

// 收藏模板/取消收藏模
export function postCollect({ themeId, action }) {
  return fetchJSON(`${API_PREFIX}/collect`, {
    method: 'post',
    themeId,
    action
  })
}
// 我的模版热度
export function getThemeHotList() {
  let url = `${
    process.env.NODE_ENV === 'dev' ? 'http://editor-dev.xiwang.com:8077' : ''
  }/monster/dashboard/theme`
  return fetchJSON(url, {
    method: 'get'
  })
}
// 更新模板
export function updateTheme(themeId, { themeType, themeGroupId }) {
  return fetchJSON(`${API_PREFIX}/theme/${themeId}`, {
    method: 'put',
    themeType,
    themeGroupId
  })
}
