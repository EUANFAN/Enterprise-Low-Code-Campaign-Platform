const properties = [
  'width',
  'height',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'translate',
  'translateX',
  'translateY',
  'opacity',
  'backgroundColor'
];
const ANIMATION_TYPES = {
  pulse: '心跳',
  bounce: '弹跳',
  shake: '晃动',
  swing: '摇摆',
  tada: '抖动',
  flash: 'flash',
  fade: '淡入淡出',
  flipX: '水平翻转',
  flipY: '垂直翻转',
  flipBounceX: '水平弹性翻转',
  flipBounceY: '垂直弹性翻转',
  swoop: '俯冲',
  whirl: '回旋',
  shrink: '收缩',
  expand: '扩张',
  bounceUp: '向上弹跳',
  bounceDown: '向下弹跳',
  bounceLeft: '向左弹跳',
  bounceRight: '向右弹跳',
  slideUp: '向上滑入',
  slideDown: '向下滑入',
  slideLeft: '向左滑入',
  slideRight: '向右滑入',
  slideUpBig: '向上滑入(大幅)',
  slideDownBig: '向下滑入(大幅)',
  slideLeftBig: '向左滑入(大幅)',
  slideRightBig: '向右滑入(大幅)',
  perspectiveUp: '透视上翻',
  perspectiveDown: '透视下翻',
  perspectiveLeft: '透视左翻',
  perspectiveRight: '透视右翻',
};
export default {
  name: {
    text: '名称',
    type: 'NormalText'
  },

  // animationType: {
  //   text: '动画参数类型',
  //   type: 'Radio',
  //   value: 'hash',
  //   options: [
  //     {
  //       text: '关键字',
  //       value: 'hash'
  //     },
  //     {
  //       text: '属性配置',
  //       value: 'property'
  //     }
  //   ]
  // },

  property: {
    text: '属性',
    type: 'Select',
    options: properties.map((property) => {
      return {
        text: property,
        value: property
      };
    }),
    when(data) {
      return data.animationType === 'property';
    }
  },
  propertyValue: {
    text: '最终值',
    type: 'NormalText',
    when(data) {
      return data.animationType === 'property';
    }
  },

  scene: {
    text: '场景',
    type: 'Radio',
    options: [
      {
        text: '显示',
        value: 'In'
      },
      {
        text: '隐藏',
        value: 'Out'
      }
    ],
    when(data) {
      return data.animationType === 'hash';
    }
  },
  type: {
    text: '类型',
    type: 'Select',
    options: Object.keys(ANIMATION_TYPES).map((type) => {
      return {
        text: ANIMATION_TYPES[type],
        value: type
      };
    }),
    when(data) {
      return data.animationType === 'hash';
    }
  },
  duration: {
    text: '持续时间(毫秒)',
    type: 'Slider',
    min: 0,
    max: 10000
  },

  delay: {
    text: '延迟(毫秒)',
    type: 'Slider',
    min: 0,
    max: 10000
  },

  loop: {
    text: '循环次数',
    type: 'Slider',
    min: 0,
    max: 100
  }
};
