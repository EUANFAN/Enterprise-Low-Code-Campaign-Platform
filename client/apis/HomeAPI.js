import { fetchJSON } from './BaseAPI';

export function getHomeSecondaryPages() {
  return fetchJSON('/api/home/pages');
}
