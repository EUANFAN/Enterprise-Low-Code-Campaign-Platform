let COMMON_PERMISSION = {
  TITLE: '希望学',
  // 编辑器区域权限
  EDITOR: {
    // 客户端
    ClIENT: [],
    // 左侧 - 页面列表
    EDITOR_PAGE_LIST: {
      ADD_PAGE: true,
      SHOW_TEMPLATE: true,
      SHOW_PAGE: true
    },
    // 左侧 - 组件列表
    EDITOR_WIDGET_LIST: {
      SHOW_LIST: true
    },
    // 左侧 - 可配置组件列表
    EDITOR_CONFIGCONTAINER_LIST: {
      SHOW_LIST: false
    },
    EDITOR_RULES: null,
    // 导航栏左侧-相关配置
    NAV_LEFT: {
      ShowTitle: true,
      Title: '返回',
      TITLE_FUNC: null // 点击title的回调函数
    },
    // 顶部中间 —— 显示的组件
    NAV_CONTROLS: [
      'Text',
      'Image',
      'Video',
      'Button',
      'HotArea',
      'Container',
      'DataContainer'
    ],
    // 顶部右侧 —— 操作权限
    NAV_OPTIONS: {
      AdvancedConfig: true,
      History: true,
      Review: false,
      SetTemplate: true,
      Preview: true,
      Save: true,
      Publish: true
    },
    // 右侧配置区
    SETTINGS: {
      LAYER: {
        /* 容器的Tab面板显示的选项卡 */
        ATTRIBUTE: true,
        LAYER: true,
        ATTRIBUTELIST: {
          LAYER: true
        }
      },
      PAGE: {
        /* 项目和页面的的Tab面板显示的选项卡 */
        ATTRIBUTE: true,
        TRIGGERS: true,
        LAYER: true,
        ATTRIBUTELIST: {
          PROJECT: true,
          PAGE: true,
          SHARE: true
        }
      },
      WIDGET: {
        /* 组件的Tab面板显示的选项卡 */
        ATTRIBUTE: true,
        ANIMATIONS: true,
        TRIGGERS: true,
        LAYER: true,
        ATTRIBUTELIST: {
          NORMAL: true,
          FEATURE: true
        }
      }
    },
    STAGE: {
      MOUSE: true
    }
  },
  PUBLISH: null
};

export default COMMON_PERMISSION;
