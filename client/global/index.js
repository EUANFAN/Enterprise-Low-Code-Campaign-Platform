/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-03-29 21:13:07
 * @LastEditors: jielang
 * @LastEditTime: 2021-04-15 17:19:28
 */
import { observable, action, computed, autorun } from 'mobx';
import { observer } from 'mobx-react';

import god from 'common/god';

import { sendErrorMessage } from 'apis/ErrorAPI';

if (
  window &&
  (window.location.host.indexOf('h5.xesv5') ||
    window.location.host.indexOf('h5.100tal'))
) {
  window.addEventListener(
    'error',
    function (event) {
      if (event.error) {
        sendErrorMessage(
          {
            userId: window.PageData.userInfo.userId,
            url: window.location.href,
          },
          event.error.stack
        );
      }
    },
    true
  );
}

god.clientSize = observable({
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
});
god.observer = observer;
window.autorun = autorun;
window.computed = computed;
window.action = action;
window.observable = observable;
god.xEditor = god.xEditor || {};
god.xEditor.store = observable({});
