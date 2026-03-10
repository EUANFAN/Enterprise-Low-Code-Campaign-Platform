import { fetchJSON } from './BaseAPI';

const DEFAULT_PAGESIZE = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_TYPE = 0;

export function getUserList({
  idType = DEFAULT_TYPE,
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGESIZE,
  keyword = '',
  userDeptId = '',
}) {
  return fetchJSON('/api/users/list', {
    idType,
    pageSize,
    page,
    keyword,
    userDeptId,
  });
}

export function getUserInfo(userIds) {
  return fetchJSON('/api/users/info', {
    method: 'post',
    userIds,
  });
}
