import { validateRoleLimit } from 'common/utils';
import { getMiniConfigOptions } from 'common/miniProgram';

export default {
  title: {
    text: '网页标题',
    type: 'NormalText',
    msg: '所有页面统一的标题，如果自定义每个页面的网页标题，须配置页面配置内的网页标题',
    useData: true
  },
  keywords: {
    text: '网页关键字',
    msg: '用于告诉搜索引擎，你网页的关键字',
    type: 'NormalText'
  },
  description: {
    text: '网页内容描述',
    msg: '用于告诉搜索引擎，你网页的主要内容',
    type: 'NormalText'
  },
  pageTransition: {
    text: '页面动效',
    type: 'Select',
    options: [
      {
        text: '普通',
        value: 'none'
      },
      {
        text: '淡入淡出',
        value: 'fade'
      },
      {
        text: '水平滑动',
        value: 'horizontalSlide'
      },
      {
        text: '垂直滑动',
        value: 'verticalSilde'
      }
    ]
  },
  runingStartTime: {
    text: '上线时间',
    type: 'TimePicker',
    when(element, project) {
      return project.editorType != 'theme';
    }
  },
  runingEndTime: {
    text: '下线时间',
    type: 'TimePicker',
    when(element, project) {
      return project.editorType != 'theme';
    }
  },
  componentPlat: {
    text: '页面端类型',
    type: 'Select',
    options: [
      {
        text: 'h5',
        value: 'h5'
      },
      {
        text: '小程序+h5',
        value: 'miniProgram'
      }
    ],
    when() {
      return validateRoleLimit('editorProjectPanelComponentPlat');
    }
  },
  miniProgramId: {
    text: '小程序',
    type: 'Select',
    async options(ctx) {
      let options = await getMiniConfigOptions(ctx);
      return options;
    },
    when(element, project) {
      return (
        validateRoleLimit('editorProjectPanelComponentPlat') &&
        project.componentPlat === 'miniProgram'
      );
    }
  },
  backgroundColor: {
    text: '背景颜色',
    type: 'ColorPicker',
    useData: true,
    when() {
      return validateRoleLimit('editorProjectPanelBackgroundColor');
    }
  },
  bgImage: {
    text: '背景图片',
    type: 'FilePicker',
    controlParams: {
      type: 'Image'
    },
    when() {
      return validateRoleLimit('editorProjectPanelBgImage');
    }
  },
  bgImageRepeat: {
    text: '背景重复',
    type: 'Select',
    options: [
      {
        text: '水平重复',
        value: 'horizon'
      },
      {
        text: '垂直重复',
        value: 'vertical'
      },
      {
        text: '水平/垂直重复',
        value: 'horizon-vertical'
      },
      {
        text: '不重复',
        value: 'none'
      }
    ],
    when(element, project) {
      return (
        !!project.bgImage && validateRoleLimit('editorProjectPanelBgImage')
      );
    }
  },
  bgImagePosition: {
    text: '背景位置',
    type: 'Align',
    when(element, project) {
      return (
        !!project.bgImage && validateRoleLimit('editorProjectPanelBgImage')
      );
    }
  },
  bgSize: {
    text: '背景大小',
    type: 'Select',
    initValue: 'auto',
    options: [
      { text: '原始大小', value: 'auto' },
      { text: '自定义', value: 'custom' }
    ],
    when(element, project) {
      return (
        !!project.bgImage && validateRoleLimit('editorProjectPanelBgImage')
      );
    }
  },
  bgSizeScale: {
    text: '背景大小倍数',
    type: 'Slider',
    min: 0,
    max: 10000,
    value: 100,
    when(element, project) {
      return (
        !!project['bgImage'] &&
        project['bgSize'] == 'custom' &&
        validateRoleLimit('editorProjectPanelBgImage')
      );
    }
  },
  stageWidth: {
    text: '舞台宽度',
    msg: '目前只支持瀑布流布局，自定义宽度为页面宽度的一半即可',
    type: 'Radio',
    options: [
      {
        text: '设备宽度',
        value: false
      },
      {
        text: '自定义宽度',
        value: true
      }
    ],
    when() {
      return validateRoleLimit('editorProjectPanelStageWidth');
    }
  },
  maxWidth: {
    text: '自定义宽度',
    type: 'Slider',
    value: 500,
    min: 0,
    max: 1000,
    when(element, project) {
      return (
        project.stageWidth && validateRoleLimit('editorProjectPanelStageWidth')
      );
    }
  },
  closeImgLazyLoad: {
    text: '图片懒加载',
    type: 'Radio',
    options: [
      {
        text: '启用',
        value: false
      },
      {
        text: '关闭',
        value: true
      }
    ],
    when() {
      return validateRoleLimit('editorProjectPanelImgLazyLoad');
    }
  },
  useData: {
    text: '使用数据',
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
    when(element, project) {
      return (
        project.type != 'separate' &&
        validateRoleLimit('editorProjectPanelUseData')
      );
    }
  },
  pageState: {
    text: '配置页内变量',
    type: 'PageStateBox',
    when(element, project) {
      return project.useData && validateRoleLimit('editorProjectPanelUseData');
    }
  },
  showDisplay: {
    text: '展示显示条件',
    type: 'Radio',
    value: 'none',
    options: [
      { text: '是', value: true },
      { text: '否', value: false }
    ],
    when(element, project) {
      return (
        project.type != 'separate' &&
        validateRoleLimit('editorProjectPanelShowDisplay')
      );
    }
  },
  userSelect: {
    text: '长按选文本',
    msg: '开启后，长按后可选中文本',
    type: 'Radio',
    value: 'auto',
    options: [
      { text: '是', value: 'auto' },
      { text: '否', value: 'none' }
    ],
    when(element, project) {
      return (
        project.type != 'separate' &&
        validateRoleLimit('editorProjectPanelUserSelect')
      );
    }
  },
  layout: {
    text: '页面布局',
    type: 'Radio',
    value: 'normal',
    options: [
      { text: '拖拽布局', value: 'normal' },
      { text: '瀑布流布局', value: 'flow' }
    ],
    when() {
      return validateRoleLimit('editorProjectPanelLayout');
    }
  },
  // TODO：由于不会使用到神策平台，所以注释掉切换入口，默认走内置平台
  // isUseSensor: {
  //   text: '日志平台',
  //   type: 'Radio',
  //   value: 'xeslog',
  //   options: [
  //     { text: '内置平台', value: 'xeslog' },
  //     { text: '神策平台', value: 'sensor' }
  //   ],
  //   when() {
  //     return validateRoleLimit('editorProjectPanelLog');
  //   }
  // },
  sensorBusinessType: {
    text: '业务线',
    type: 'Radio',
    value: 'sensor',
    options: [
      { text: '1对1', value: 'sensor' },
      { text: '爱智康', value: 'izksa' },
      { text: '小猴', value: 'monkey' },
      { text: '哒哒', value: 'dada' }
    ],
    when(element, project) {
      return project.isUseSensor === 'sensor';
    }
  },
  comLogData: {
    text: '日志公共字段',
    type: 'Set',
    optionsUseData: true,
    when() {
      return validateRoleLimit('editorProjectPanelComLogData');
    }
  },
  // notRuning: {
  //   text: '未处于上线时间页面',
  //   type: 'Radio',
  //   value: 'default',
  //   options: [
  //     { text: '网校默认', value: 'default' },
  //     { text: '其他', value: 'other' }
  //   ],
  //   when(project) {
  //     return project.hightOptions;
  //   }
  // },
  // notRuningStart: {
  //   text: '活动未开始链接',
  //   type: 'Input',
  //   value: '',
  //   when(project) {
  //     return project.hightOptions.notRuning == 'other';
  //   }
  // },
  // RuningEnd: {
  //   text: '活动已结束链接',
  //   type: 'Input',
  //   value: '',
  //   when(project) {
  //     return project.hightOptions.notRuning == 'other';
  //   }
  // }
  // usePreloader: {
  //   text: '预加载',
  //   type: 'Radio',
  //   options: [
  //   ]
  // },
  // preLoadBackgroundImg: {
  //   text: '预加载背景',
  //   type: 'FilePicker',
  //   when(project) {
  //     return !!project.usePreloader;
  //   },
  // },
  checkLogin: {
    text: '检测登录',
    type: 'Radio',
    options: [
      { text: '是', value: true },
      { text: '否', value: false }
    ]
  },
  dataBox: {
    text: '配置数据',
    type: 'DataBox',
    when() {
      return validateRoleLimit('editorProjectPanelDataBox');
    }
  }
};
