import request from 'common/request';
export async function fetchJSON(url, options = {}) {
  let response;
  try {
    const { method = 'get', ...data } = options;
    response = await request.fetch({ url, method, data });
  } catch (err) {
    console.error(err);
    throw new Error('发生未知错误，请重试');
  }
  if (response.errno !== 0) {
    throw new Error(response.msg);
  }
  return response.data;
}
