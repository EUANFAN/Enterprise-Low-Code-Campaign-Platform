import { fetchJSON } from './BaseAPI';

const DEFAULT_PAGESIZE = 10;
const DEFAULT_PAGE = 1;

export function getNoticeList({
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGESIZE,
}) {
  return fetchJSON('/api/notices/list', {
    pageSize,
    page,
  });
}

export function createOrUpdate({
  id = '',
  userId,
  title,
  content,
  startTime,
  endTime,
  force = '',
}) {
  return fetchJSON('/api/notices/create', {
    method: 'post',
    id,
    userId,
    title,
    content,
    startTime,
    endTime,
    force,
  });
}

export function deleteNoticeRecord({ id }) {
  return fetchJSON(`/api/notices/delete/${id}`, {
    method: 'delete',
    id,
  });
}
export function getNoticeInfo(id) {
  return fetchJSON('/api/notices/info', {
    method: 'post',
    id,
  });
}
