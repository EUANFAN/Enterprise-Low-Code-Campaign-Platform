import { validateRoleLimit } from 'common/utils';
export default {
  name: {
    text: '名称',
    type: 'NormalText',
  },
  width: {
    text: '宽度',
    type: 'Slider',
    min: 0,
    max: 800,
    when(data) {
      return data.layout == 'normal';
    },
  },
  height: {
    text: '高度',
    type: 'Slider',
    min: 0,
    max: 16000,
    when(data) {
      // 所有的 widget，当选择了自动调整高度的时候，则不再显示
      if (data.type === 'Carousel') {
        return true;
      }
      // if (data.layout === 'flow' && hasHeightWidget(data)) {
      //   return true;
      // }
      if (data.layout === 'normal' && !data.data.autoHeight) {
        return true;
      }

      return false;
    },
  },
  minHeight: {
    text: '最小高度',
    type: 'Slider',
    min: 0,
    max: 16000,
    when(data) {
      if (data.data.autoHeight || data.type == 'Image') {
        return false;
      }
      return data.layout === 'flow';
    },
  },
  rotate: {
    text: '旋转',
    type: 'Slider',
    min: 0,
    max: 360,
  },
  opacity: {
    text: '不透明度',
    type: 'Slider',
    min: 0,
    max: 100,
  },
  hasBorderRadius: {
    text: '有无圆角',
    type: 'Radio',
    options: [
      {
        text: '有',
        value: true,
      },
      {
        text: '无',
        value: false,
      },
    ],
  },
  borderRadiusPosition: {
    text: '圆角位置',
    type: 'CheckBox',
    options: [
      {
        text: '左上',
        value: 'TopLeft',
      },
      {
        text: '右上',
        value: 'TopRight',
      },
      {
        text: '左下',
        value: 'BottomLeft',
      },
      {
        text: '右下',
        value: 'BottomRight',
      },
    ],
    when(data) {
      return data.hasBorderRadius;
    },
  },
  borderRadius: {
    text: '圆角值',
    type: 'Slider',
    min: 0,
    max: 150,
    when(data) {
      return data.hasBorderRadius;
    },
  },
  hasBorder: {
    text: '有无边框',
    type: 'Radio',
    options: [
      {
        text: '有',
        value: true,
      },
      {
        text: '无',
        value: false,
      },
    ],
  },
  borderStyle: {
    text: '边框样式',
    type: 'Select',
    options: [
      {
        text: '实线',
        value: 'solid',
      },
      {
        text: '虚线',
        value: 'dashed',
      },
      {
        text: '点线',
        value: 'dotted',
      },
      {
        text: '双线',
        value: 'double',
      },
      {
        text: '沟槽',
        value: 'groove',
      },
      {
        text: '脊状',
        value: 'ridge',
      },
      {
        text: '内嵌',
        value: 'inset',
      },
      {
        text: '外突',
        value: 'outset',
      },
    ],
    when(data) {
      return data.hasBorder;
    },
  },
  borderWidth: {
    text: '边框宽度',
    type: 'Slider',
    min: 0,
    max: 100,
    when(data) {
      return data.hasBorder;
    },
  },
  borderColor: {
    text: '边框颜色',
    type: 'ColorPicker',
    when(data) {
      return data.hasBorder;
    },
  },
  borderDirections: {
    text: '边框方向',
    type: 'CheckBox',
    options: [
      {
        text: '上',
        value: 'top',
      },
      {
        text: '右',
        value: 'right',
      },
      {
        text: '下',
        value: 'bottom',
      },
      {
        text: '左',
        value: 'left',
      },
    ],
    when(data) {
      return data.hasBorder;
    },
  },
  hasShadow: {
    text: '有无阴影',
    type: 'Radio',
    options: [
      {
        text: '有',
        value: true,
      },
      {
        text: '无',
        value: false,
      },
    ],
  },
  shadowStyle: {
    text: '阴影类型',
    type: 'Select',
    options: [
      {
        text: '外阴影',
        value: 'outset',
      },
      {
        text: '内阴影',
        value: 'inset',
      },
    ],
    when(data) {
      return data.hasShadow;
    },
  },
  shadowX: {
    text: '水平阴影',
    type: 'Slider',
    min: -50,
    max: 50,
    when(data) {
      return data.hasShadow;
    },
  },
  shadowY: {
    text: '垂直阴影',
    type: 'Slider',
    min: -50,
    max: 50,
    when(data) {
      return data.hasShadow;
    },
  },
  shadowBlur: {
    text: '阴影模糊距离',
    type: 'Slider',
    min: 0,
    max: 100,
    when(data) {
      return data.hasShadow;
    },
  },
  shadowSpread: {
    text: '阴影尺寸',
    type: 'Slider',
    min: 0,
    max: 100,
    when(data) {
      return data.hasShadow;
    },
  },
  shadowColor: {
    text: '阴影颜色',
    type: 'ColorPicker',
    when(data) {
      return data.hasShadow;
    },
  },
  layout: {
    text: '布局形式',
    type: 'Radio',
    options: [
      {
        text: '瀑布流布局',
        value: 'flow',
      },
      {
        text: '拖拽布局',
        value: 'normal'
      }
    ],
    when() {
      return validateRoleLimit('editorWidgetPanelLayout');
    }
  },
  align: {
    text: '定位位置',
    type: 'Align',
    when(data) {
      return data.layout == 'normal' || data.location == 'screen';
    },
  },
  alignLeftMargin: {
    text: '距左边距',
    type: 'Slider',
    min: -1000,
    max: 1000,
    when(data) {
      return data.layout == 'normal' && data.align.indexOf('left') > -1;
    },
  },
  alignRightMargin: {
    text: '距右边距',
    type: 'Slider',
    min: -1000,
    max: 1000,
    when(data) {
      return data.layout == 'normal' && data.align.indexOf('right') > -1;
    },
  },
  alignTopMargin: {
    text: '距上边距',
    type: 'Slider',
    min: -1000,
    max: 1000,
    when(data) {
      return data.layout == 'normal' && data.align.indexOf('top') > -1;
    },
  },
  alignBottomMargin: {
    text: '距下边距',
    type: 'Slider',
    min: -1000,
    max: 1000,
    when(data) {
      return data.layout == 'normal' && data.align.indexOf('bottom') > -1;
    },
  },
  overflowY: {
    text: '溢出滚动',
    type: 'Radio',
    options: [
      {
        text: '是',
        value: 'auto',
      },
      {
        text: '否',
        value: 'hidden',
      },
    ],
    when(data) {
      return data.layout == 'normal' && data.hasLayers;
    },
  },
  bgColor: {
    text: '背景颜色',
    type: 'ColorPicker',
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
  adaptIphoneX: {
    text: '适配iphoneX',
    type: 'Radio',
    options: [
      {
        text: '是',
        value: false,
      },
      {
        text: '否',
        value: true,
      },
    ],
    when(data) {
      return data.layout == 'normal' && data.align.indexOf('bottom') > -1;
    },
  },
  margin: {
    text: '外边距',
    type: 'Margin',
    when(data) {
      return data.layout == 'flow';
    },
  },
  padding: {
    text: '内边距',
    type: 'Padding',
  },
  locked: {
    text: '锁定样式',
    type: 'Radio',
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
  readonly: {
    text: '是否只读',
    type: 'Radio',
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
  location: {
    text: '是否悬浮',
    type: 'Radio',
    options: [
      {
        text: '否',
        value: 'page',
      },
      {
        text: '是',
        value: 'screen',
      },
    ],
  },
  bgImage: {
    text: '背景图片',
    type: 'FilePicker',
    controlParams: {
      type: 'Image',
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
      return !!data['bgImage'] && data.bgSize == 'custom';
    },
  },
  isFullPage: {
    text: '是否全屏',
    type: 'Radio',
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
};
