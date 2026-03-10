import WX_PERMISSION from './index';
import merge from 'lodash/mergeWith';
function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return srcValue;
  }
}
let MALL_PERMISSION = merge(
  WX_PERMISSION,
  {
    EDITOR: {
      // 左侧 - 页面列表
      EDITOR_PAGE_LIST: {
        ADD_PAGE: false,
        SHOW_TEMPLATE: false,
      },
      EDITOR_WIDGET_LIST: {
        SHOW_LIST: false,
      },
      // 顶部中间 —— 显示的组件
      NAV_CONTROLS: [],
      // 顶部右侧 —— 操作权限
      NAV_OPTIONS: {
        SetTemplate: false,
        Publish: false,
        Save: {
          screenshot: true,
          afterSave: (ctx) => {
            let page = ctx.project.pages[0];
            const origin = ctx.getProjectOrigin();
            let mallWidget = page.widgets.filter((widget) => {
              return ~widget.type.indexOf(origin);
            });
            const thirdPartyConfig = ctx.getThirdPartyConfig();
            const searchObj = ctx.getUrlParmas(god.location.href);
            const type = searchObj.type || 1; // 1: 常规保存 2: 支付成功
            if (mallWidget.length && thirdPartyConfig) {
              return new Promise((reslove) => {
                ctx
                  .post(`https://legao.xueersi.com/h5content/save/${type}`, {
                    channel_info_id: thirdPartyConfig.channel_info_id,
                    channel_id: thirdPartyConfig.channel_id,
                    column_id: thirdPartyConfig.column_id,
                    pag_info_id: ctx.project._id,
                    content: JSON.stringify(mallWidget[0].data),
                  })
                  .then((res) => {
                    if (res.status) {
                      god.location.href = res.data.url;
                      reslove(res.status);
                    } else {
                      reslove(false);
                    }
                  });
              });
            }
          },
        },
      },
      // 右侧配置区
      SETTINGS: {
        LAYER: null,
        WIDGET: {
          /* 组件的Tab面板显示的选项卡 */ ATTRIBUTE: true,
          ANIMATIONS: false,
          TRIGGERS: false,
          LAYER: false,
          ATTRIBUTELIST: {
            NORMAL: false,
            FEATURE: true,
          },
        },
        PAGE: null,
      },
    },
  },
  customizer
);
export default MALL_PERMISSION;
