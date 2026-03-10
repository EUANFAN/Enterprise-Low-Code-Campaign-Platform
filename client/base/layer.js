export default {
  name: {
    text: '名称',
    type: 'NormalText'
  },
  width: {
    text: '宽度',
    type: 'Slider',
    min: 0,
    max: 800,
    when(data) {
      return data.layout == 'normal';
    }
  },
  closeImgLazyLoad: {
    text: '图片懒加载',
    type: 'Radio',
    options: [{
      text: '启用',
      value: false
    }, {
      text: '关闭',
      value: true
    }]
  },
  isFullPage: {
    text: '是否全屏',
    type: 'Radio',
    options: [
      {
        text: '是',
        value: true
      },
      {
        text: '否',
        value: false
      }
    ],
  },
  heightSetting: {
    text: '高度设置',
    type: 'Radio',
    options: [
      {
        text: '手动调整',
        value: 'handAdjust'
      },
      {
        text: '自动调整',
        value: 'autoAdjust'
      }
    ],
    when(layer) {
      return !layer.isFullPage;
    }
  },
  height: {
    text: '高度',
    type: 'Slider',
    min: 0,
    max: 16000,
    when(layer) {
      return layer.heightSetting === 'handAdjust' && !layer.isFullPage;
    }
  },
  bgColor: {
    text: '背景颜色',
    type: 'ColorPicker'
  }
};
