import { getUrlVars } from 'common/getUrlVars'
import { post, get, jsonp } from '@k9/x-com'
import store from 'store/preview'
import { observable } from 'mobx'
export async function getDataContainerData(method, url, dataParams) {
  let params = {
    _canche: true
  }
  dataParams.forEach((param) => {
    if (param['type'] == 'fix') {
      params[param.key] = param['value']
      if (param['dataType'] == 'Number') {
        params[param.key] = Number(param['value'])
      }
      if (param['dataType'] == 'Boolean') {
        params[param.key] = Boolean(param['value'])
      }
    }
    if (param['type'] == 'query') {
      params[param.key] = getUrlVars(location.href)[param.key]
    }
    if (param['type'] == 'pagestate') {
      params[param.key] = store.getPageDataByKey(param.key)
    }
  })
  let request = { post, get, jsonp }
  return request[method.toLowerCase() || 'post'](url, params)
}

export function setDataToProjectVariableStore(project, data) {
  if (project.clazz === 'project') {
    project.variableStore.set('PROJECT_VARIABLE', observable.map(data))
  } else {
    project.variableStore.replace(observable.map(data))
  }
}

export async function handlePageDataByVariableStore(project, container) {
  const result = await getDataContainerData(
    container.dataBox.method,
    container.dataBox.requestUrl,
    container.dataBox.params
  )
  if (result.code == 0) {
    setDataToProjectVariableStore(container, result.data)
  }
}
