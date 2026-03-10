import { fetchJSON } from './BaseAPI'
import QueryString from 'common/queryString'
import { QUERY_SEPARATOR } from 'common/constants'
import { compareData } from 'common/comparePageData'
import { toJS } from 'mobx'
import { post, getUrlParmas } from '@k9/x-com'
import { getStageConfig } from 'common/config'
import { getDefaultClient } from 'common/utils'

export async function createProject({
  roleId,
  path,
  name,
  pageCount,
  themeId,
  layoutType,
  type,
  runingTime,
  componentPlat,
  miniProgramId,
  tags
}) {
  let res = await getStageConfig('EDITOR')
  if (res.loaded) {
    const client = getDefaultClient(res.config['ClIENT'], 'client')
    return fetchJSON(`/api/projects/${roleId}/${path || ''}`, {
      method: 'post',
      name,
      themeId,
      pageCount,
      layoutType,
      type,
      client,
      runingTime,
      componentPlat,
      miniProgramId,
      tags
    })
  }
}

export async function createProjectByPath({
  path, // path 为 'roleId/folderId/folderId...' 的格式
  name,
  pageCount = 1,
  layoutType,
  themeId,
  runingTime,
  componentPlat,
  miniProgramId,
  tags
}) {
  let res = await getStageConfig('EDITOR')
  if (res.loaded) {
    const client = getDefaultClient(res.config['ClIENT'], 'client')
    return fetchJSON(`/api/projects/${path}`, {
      method: 'post',
      name,
      themeId,
      pageCount,
      layoutType,
      client,
      runingTime,
      componentPlat,
      miniProgramId,
      tags
    })
  }
}

export function getProjects({
  roleId,
  path = '',
  current = 1,
  search = '',
  pageSize = 10,
  filter = '',
  projectId = '',
  department = ''
}) {
  const queryParams = QueryString.stringify({
    current,
    pageSize,
    search,
    filter,
    department,
    projectId
  })
  return fetchJSON(`/api/projects/${roleId}/${path}?${queryParams}`)
}

export function getProjectsComponents(
  id = '',
  chooseAll = false,
  noSelectIds = '',
  roleId,
  folderId
) {
  const newData = {
    id,
    chooseAll,
    noSelectIds,
    roleId,
    folderId
  }
  return post('/project/component', newData)
}
export function updateProjectsComponents(
  id = '',
  chooseAll = false,
  noSelectIds = '',
  roleId,
  folderId,
  targetComponent
) {
  const newData = {
    id,
    chooseAll,
    noSelectIds,
    roleId,
    folderId,
    targetComponent: JSON.stringify(toJS(targetComponent))
  }
  return post('/project/updateComponent', newData)
}

/**
 * 获取发布 URL
 * @param  {string} projectId 目标项目 ID
 * @param  {string} long      是否为长链接
 * @return {Promise<string>}  一个 Promise ，回传值为链接字串
 */
export function getPublishedUrl(projectId, long = false) {
  return fetchJSON(`/api/projects/${projectId}/url`, {
    long: long ? '1' : '0'
  })
}

export async function updateProject(projectId, data = {}, action = 'update') {
  let newData = {
    project: JSON.stringify(await compareData(toJS(data), 'project'))
  }
  return fetchJSON(`/project/update?id=${projectId}&action=${action}`, {
    method: 'post',
    ...newData
  })
}

export async function updateProjectInfo(params) {
  return fetchJSON('/project/updateInfo', {
    method: 'post',
    params
  })
}

export function createNewFolder(name, currentRoleId, currentFoldersId) {
  return fetchJSON(
    `/api/projects/${currentRoleId}/${
      currentFoldersId ? currentFoldersId + '/' : ''
    }folder`,
    {
      method: 'post',
      name
    }
  )
}

export function deleteProjects(
  roleId,
  projectIds = [],
  folderIds = [],
  data = {}
) {
  const folders = folderIds.length === 0 ? '' : `${folderIds.join('/')}/`
  const projects = projectIds.join(QUERY_SEPARATOR)
  return fetchJSON(`/api/projects/${roleId}/${folders}${projects}`, {
    method: 'delete',
    ...data
  })
}
export function restoreProjects(
  roleId,
  projectIds = [],
  folderIds = [],
  data = {}
) {
  const folders = folderIds.length === 0 ? '' : `${folderIds.join('/')}/`
  const projects = projectIds.join(QUERY_SEPARATOR)
  return fetchJSON(`/api/projects/${roleId}/${folders}${projects}`, {
    method: 'put',
    ...data
  })
}

export function copyProject(params) {
  return fetchJSON(`/project/copy?${params}`, { method: 'post' })
}
export function getProjectById(projectId) {
  return fetchJSON(`/project/data?id=${projectId}`, { method: 'post' })
}

export function renameProject(targetModalInfoId, name, type) {
  return fetchJSON(
    `/project/rename?id=${targetModalInfoId}&name=${name}&type=${type}`,
    {
      method: 'post'
    }
  )
}

export function addChildrenToFolder(
  projectIds = [],
  toFolder,
  roleId,
  folderId,
  noSelectIds,
  chooseAll
) {
  return fetchJSON('/api/projects/move', {
    method: 'put',
    projectIds,
    toFolder,
    roleId,
    folderId,
    noSelectIds,
    chooseAll
  })
}

export function bulkPublishProjects(selectedIds = [], data) {
  return fetchJSON('/api/projects/bulkPublish', {
    method: 'put',
    selectedIds: selectedIds.join(QUERY_SEPARATOR),
    ...data
  })
}

export function approProject(projectId, report_type, options) {
  return fetchJSON(`/api/projects/${projectId}/appro`, {
    method: 'post',
    report_type,
    options
  })
}

export function getProjectCollaborator(projectId = '') {
  return fetchJSON(`/api/projects/collaborator?projectId=${projectId}`)
}

export function addProjectCollaborator(projectId = '', userIds = []) {
  return fetchJSON('/api/projects/collaborator', {
    method: 'post',
    projectId,
    userIds
  })
}

export function removeProjectCollaborator(projectId = '', userIds = []) {
  return fetchJSON('/api/projects/collaborator', {
    method: 'delete',
    projectId,
    userIds
  })
}
// hybrid 支持API创建应用
export function webhookApplicationCreateApi(parms) {
  return fetchJSON(
    'https://hybridplatform-test.xueersi.com/webhook/application/create',
    {
      method: 'post',
      parms
    }
  )
}
// 创建hybrid应用
export function projectsCreateHybridApi(parms) {
  return fetchJSON('/project/createHybrid', {
    method: 'post',
    parms
  })
}
// 获取hybrid信息
export function projectsPublishHybridApi(parms) {
  return fetchJSON('/project/publishHybrid', {
    method: 'post',
    parms
  })
}

// 获取模版数据入口配置
export function getThemeDataConfig() {
  let urlParmas = getUrlParmas()
  return new Promise((resolve) => {
    post(
      'https://booster.xueersi.com/h5EditStation/ConfigCollection/GetConfig',
      {
        ruleId: '613f27bf3e9498e17be29d0d',
        type: urlParmas['type'] ? urlParmas['type'] : 'prod'
      }
    ).then((res) => {
      if (res.code == 0) {
        resolve(res.data.config['themeData'])
      } else {
        resolve(false)
      }
    })
  })
}

export function getMiniProgramList() {
  return post(
    'https://booster.xueersi.com/h5EditStation/ConfigCollection/GetConfig',
    {
      ruleId: '613f27bf3e9498e17be29d0d'
    }
  )
}
