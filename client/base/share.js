const CHINESE_REGEX = /[\u4e00-\u9fa5]/;
let isMiniProgram = false;
try {
  isMiniProgram = PageData.project.revisionData.componentPlat == 'miniProgram';
} catch (error) {
  isMiniProgram = false;
}

export default {
  shareTitle: {
    text: '分享标题',
    type: 'NormalText',
    value: '示例平台',
    useData: true
  },
  shareContent: {
    text: '分享内容',
    type: 'NormalText',
    value: '',
    useData: true
  },
  shareUrl: {
    text: '分享地址',
    msg: '不填此项，则为分享当前页面',
    type: 'NormalText',
    value: '',
    validate(value) {
      if (value) {
        if(!/https?:\/\//ig.test(value)) return { stat: false, msg: '分享地址必须是一个可访问的链接' };
      }
      return { stat: true, msg: '' };
    },
    useData: true
  },
  shareImgUrl: {
    text: '分享图标',
    type: 'FilePicker',
    msg: '分享图标只对微信有效,客户端使用默认图标',
    controlParams: {
      type: 'Image'
    },
    value: '',
    checkError(value) {
      if (CHINESE_REGEX.test(value)) {
        return '分享图标的图片名称不能为中文，否则会被拦截，导致分享失败';
      }
      return true;
    },
    useData: true
  },
  shareWidget: {
    text: '分享组件',
    msg: '添加拥有分享行为的组件',
    type: 'WidgetSelect'
  },
  showModal: {
    text: '蒙层显示',
    type: 'Radio',
    value: false,
    options: [
      { text: '是', value: true },
      { text: '否', value: false }
    ]
  },
  modalWidget: {
    text: '蒙层选择',
    type: 'WidgetSelect',
    when(trigger) {
      return trigger.showModal;
    }
  },
  menuItem: {
    text: '分享渠道',
    type: 'CheckBox',
    value: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareQZone'],
    options: [
      { text: '朋友圈', value: 'onMenuShareTimeline' },
      { text: '微信好友', value: 'onMenuShareAppMessage' },
      // { text: 'QQ好友', value: 'onMenuShareQQ' },
      // { text: 'QZone', value: 'onMenuShareQZone' }
    ]
  },
  getUserInfo: {
    text: '用户信息',
    msg: '分享url带上当前用户信息',
    type: 'Radio',
    value: false,
    options: [
      { text: '是', value: true },
      { text: '否', value: false }
    ]
  },
  wxMiniId: {
    type: 'NormalText',
    text: '原始ID',
    msg: '小程序原始ID, 如gh_c46843a58e20',
    value: 'gh_c46843a58e20',
    useData: true,
    when() {
      return isMiniProgram;
    }
  },
  wxMiniPath: {
    type: 'NormalText',
    text: '小程序路径',
    msg: '不填此项，则分享当前页面',
    useData: true,
    when() {
      return isMiniProgram;
    }
  },
  wxMiniImageUrl: {
    text: '分享图片',
    type: 'FilePicker',
    msg: '小程序',
    useData: true,
    when() {
      return isMiniProgram;
    }
  }
};
