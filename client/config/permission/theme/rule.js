/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:04
 */
import CommonPermission from 'config/permission/common/index';
import { publishConfig, updateRule } from 'apis/RuleAPI';
import { toastError } from 'components/HEToast';
import merge from 'lodash/merge';
import 'globals';
const userInfo = god.PageData.userInfo;
let publish = async (ctx) => {
  const { project } = ctx;
  await updateRule({
    id: project.ruleId,
    action: 'publish',
  });
  let res = await publishConfig(project.ruleId, userInfo.userId);
  if (res.code != 0) {
    toastError(res.msg);
  }
};

let THEME_PERMISSION = merge(CommonPermission, {
  EDITOR: {
    // 左侧 - 页面列表
    EDITOR_PAGE_LIST: {
      SHOW_TEMPLATE: false,
    },
    EDITOR_WIDGET_LIST: {
      SHOW_LIST: true,
    },
    NAV_LEFT: {
      ShowTitle: true,
      Title: '返回规则配置',
      TITLE_FUNC: function (project) {
        location.href = `/customRule/${project.ruleId}`;
      },
    },
    NAV_OPTIONS: {
      SetTemplate: false,
      Save: true,
      Publish: {
        beforePublish(ctx) {
          publish(ctx);
        },
      },
    },
  },
  PUBLISH: {
    EDIT_PATH: function (projectId, project) {
      return `/editor/theme/${projectId}?ruleId=${project.revisionData.ruleId}&type=gray`;
    },
  },
});

export default THEME_PERMISSION;
