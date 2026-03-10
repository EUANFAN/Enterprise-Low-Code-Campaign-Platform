import { fetchJSON } from './BaseAPI';
// 获取部门列表
export function getBizList() {
  return fetchJSON('/bizunit/list', {
    method: 'get',
  });
}
