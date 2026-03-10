import { fetchJSON } from './BaseAPI';
import QueryString from 'common/queryString';
export function getLogs(projectId, current = 1, pageSize = 10) {
  const queryParams = QueryString.stringify({
    current,
    pageSize,
    projectId,
  });
  return fetchJSON(`/api/logs/all/?${queryParams}`);
}
