import { fetchJSON } from './BaseAPI';
import QueryString from 'common/queryString';

export function getTagList(component = 'widget', type = '') {
  const queryParams = QueryString.stringify({
    component,
    type
  });
  return fetchJSON(`/tag/list/?${queryParams}`);
}

export function getProjectTagList() {
  return fetchJSON('/tag/project/list');
}
