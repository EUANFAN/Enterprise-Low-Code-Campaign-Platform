/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 19:27:42
 */
export function getUrlVars(url) {
  let vars = {};
  url.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

export function getCookie(name) {
  let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  let arr = document.cookie.match(reg);
  if (arr) {
    return unescape(arr[2]);
  } else {
    return '';
  }
}
