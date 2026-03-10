import CommonPermission from 'config/permission/common/index';
import merge from 'lodash/merge';
let THEME_PERMISSION = merge(CommonPermission, {
  EDITOR: {
    // 左侧 - 页面列表
    EDITOR_PAGE_LIST: {
      SHOW_TEMPLATE: false,
    },
    EDITOR_WIDGET_LIST: {
      SHOW_LIST: true,
    },
    NAV_OPTIONS: {
      SetTemplate: false,
      Save: true,
      Publish: true,
    },
  },
  PUBLISH: {
    EDIT_PATH: function (projectId) {
      return `/editor/theme/${projectId}`;
    },
  },
});

export default THEME_PERMISSION;
