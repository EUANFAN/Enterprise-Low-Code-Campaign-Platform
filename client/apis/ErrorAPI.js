/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-04-14 18:42:12
 * @LastEditors: jielang
 * @LastEditTime: 2021-04-15 16:16:36
 */
import { fetchJSON } from './BaseAPI';

export function sendErrorMessage(options, err) {
  return fetchJSON('/error/send', {
    method: 'post',
    options,
    err,
  });
}
