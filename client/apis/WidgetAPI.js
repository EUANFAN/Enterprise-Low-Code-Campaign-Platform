import { fetchJSON } from './BaseAPI'

export function getComponentInfo(type) {
  return fetchJSON('/widget/list', {
    method: 'post',
    q: type,
    onlySetuped: false,
    current: 1,
    precise: true
  }).then((data) => data.widgets?.[0] || null)
}

/**
 * 获取组件列表
 * @param {string} q 组件关键字
 * @param {string} type action | widget | rule
 * @param {string} group 组件分组
 * @param {boolean} deleted 是否删除
 * @param {string} onlySetuped true  是否已安装
 * @param {boolean} onlyUsed 是否已使用
 * @param {number} current 当前页
 * @param {number} pageSize 总页
 */
export function getWidgetList({
  q,
  current,
  pageSize,
  userDeptId,
  type,
  group,
  deleted,
  onlySetuped,
  onlyUsed = [],
  componentPlat,
  selectedTags = [],
  tagType = '',
  precise = false
}) {
  let queryParams = {
    q,
    type: type || 'widget',
    group,
    deleted,
    onlySetuped,
    onlyUsed: onlyUsed,
    current: current || 1,
    pageSize: pageSize || 10,
    userDeptId,
    componentPlat,
    selectedTags: selectedTags,
    tagType: tagType,
    precise
  }
  Object.keys(queryParams).forEach((key) => {
    if (!queryParams[key]) {
      delete queryParams[key]
    }
  })
  return fetchJSON('/widget/list', {
    method: 'post',
    ...queryParams
  })
}

export function widgetCount(type) {
  return fetchJSON('/widget/count', { type: type })
}

export function getWidgetInfo(type, version) {
  return fetchJSON('/widget/info', { type, version })
}

/**
 * TODO: 和resource 中方法一样，可以进一步封装（非原生Fetch）
 * 更新/上传组件预览图
 */
export async function updateWidgetPoster(formData) {
  const response = await fetch('/widget/poster', {
    method: 'post',
    body: formData,
    credentials: 'same-origin'
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  const { data, errno, msg } = await response.json()
  if (errno !== 0) {
    throw new Error(msg)
  }
  return data
}

export function widgetDelete(id, deleted) {
  return fetchJSON('/widget/delete', {
    method: 'post',
    id: id,
    deleted: deleted
  })
}

export function widgetUpdate(param) {
  return fetchJSON('/widget/update', {
    method: 'post',
    ...param
  })
}
