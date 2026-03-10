import { fetchJSON } from './BaseAPI';
import QueryString from 'common/queryString';

export function getAdminList(id) {
  if (id) {
    const queryParams = QueryString.stringify({
      id,
    });
    return fetchJSON(`/api/data/adminData/?${queryParams}`);
  } else {
    return fetchJSON('/api/data/adminData');
  }
}
export function getProjectData(searchType, logType, id) {
  let queryParams = {};
  if (id) {
    queryParams = QueryString.stringify({
      searchType,
      logType,
      id,
    });
  } else {
    queryParams = QueryString.stringify({
      searchType,
      logType,
    });
  }
  return fetchJSON(`/api/data/getProjectData/?${queryParams}`);
}
