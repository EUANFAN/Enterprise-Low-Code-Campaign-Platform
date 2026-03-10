import CommonPermission from 'config/permission/common/index';
import merge from 'lodash/merge';

let XUEERSI_PERMISSION = merge(CommonPermission, {
  TITLE: '示例公司',
  EDITOR: {
    // 客户端
    ClIENT: [
      {
        text: '网校客户端',
        value: 'jzh'
      }
    ]
  },
  PUBLISH: {
    URL: (targetUrl) => {
      return targetUrl;
    }
  }
});

export default XUEERSI_PERMISSION;
