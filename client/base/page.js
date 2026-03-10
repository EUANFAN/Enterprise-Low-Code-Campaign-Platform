import { validateRoleLimit } from 'common/utils';
export default {
  name: {
    text: '名称',
    type: 'NormalText',
  },
  pageTitle: {
    text: '网页标题',
    msg: '自定义每页的网页标题，每一页的网页标题会覆盖调统一的网页标题。',
    type: 'NormalText',
    useData: true,
  },
  bgColor: {
    text: '背景颜色',
    type: 'ColorPicker',
  },
  bgImage: {
    text: '背景图片',
    type: 'FilePicker',
    controlParams: {
      type: 'Image',
    },
  },
  bgImageRepeat: {
    text: '背景重复',
    type: 'Select',
    options: [
      {
        text: '水平重复',
        value: 'horizon',
      },
      {
        text: '垂直重复',
        value: 'vertical',
      },
      {
        text: '水平/垂直重复',
        value: 'horizon-vertical',
      },
      {
        text: '不重复',
        value: 'none',
      },
    ],
    when(data) {
      return !!data.bgImage;
    },
  },
  bgImagePosition: {
    text: '背景位置',
    type: 'Align',
    when(data) {
      return !!data.bgImage;
    },
  },
  bgSize: {
    text: '背景大小',
    type: 'Select',
    initValue: 'auto',
    options: [
      { text: '原始大小', value: 'auto' },
      { text: '适配长边', value: 'cover' },
      { text: '适配短边', value: 'contain' },
      { text: '自定义', value: 'custom' },
    ],

    when(data) {
      return !!data['bgImage'];
    },
  },
  bgSizeScale: {
    text: '背景大小倍数',
    type: 'Slider',
    min: 0,
    max: 10000,
    value: 100,
    when(data) {
      return !!data['bgImage'] && data['bgSize'] == 'custom';
    },
  },
  isFullPage: {
    text: '是否全屏',
    type: 'Radio',
    value: false,
    options: [
      {
        text: '是',
        value: true,
      },
      {
        text: '否',
        value: false,
      },
    ],
  },
  heightSetting: {
    text: '高度设置',
    type: 'Radio',
    options: [
      {
        text: '手动调整',
        value: 'handAdjust',
      },
      {
        text: '自动调整',
        value: 'autoAdjust',
      },
    ],
    when(page) {
      return !page.isFullPage;
    },
  },
  height: {
    text: '手动调整',
    type: 'Slider',
    min: 0,
    max: 16000,
    when(page) {
      return page.heightSetting === 'handAdjust' && !page.isFullPage;
    },
  },
  dataBox: {
    text: '配置数据',
    type: 'DataBox',
    when() {
      return validateRoleLimit('editorPagePanelDataBox');
    }
  }
};
