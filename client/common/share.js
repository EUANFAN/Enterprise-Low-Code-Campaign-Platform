import { post, sendClickLog } from '@k9/x-com';
import loadScript from 'common/loadScript';
import { getClient, getWidget, getPlantform, localStorage } from 'common/utils';
import previewStore from 'store/preview';
import { useDataValue, hasVariable } from 'utils/ModelUtils';
import qs from 'query-string';

function getShareScence(menuItem) {
  const defaultArray = {
    onMenuShareAppMessage: 1,
    onMenuShareTimeline: 2,
    onMenuShareQQ: 4,
    onMenuShareQZone: 8,
  };
  let shareScence = 16;
  menuItem.forEach(function (value) {
    shareScence += defaultArray[value];
  });
  return {
    shareScence,
  };
}

function applyWxConfig(ready, error) {
  return loadScript('//res.wx.qq.com/open/js/jweixin-1.6.0.js').then(
    function () {
      let wx = window.wx;
      post('//weixin.xueersi.com/Share/conf', { wxAppNum: 11 }).then((data) => {
        if (data.sign) {
          let wxData = data.msg.wxConf;
          wx.config({
            debug: false,
            appId: wxData.appId,
            timestamp: wxData.timeStamp,
            nonceStr: wxData.nonceStr,
            signature: wxData.signature,
            jsApiList: [
              'chooseWXPay',
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareQZone',
              'onMenuShareWeibo',
            ],
            openTagList: ['wx-open-launch-weapp', 'wx-open-launch-app'],
          });
          wx.ready(() => {
            ready && ready();
          });
          wx.error(() => {
            error && error();
          });
        }
      });
    }
  );
}
function getShareConfig() {
  const project = previewStore.getProject();
  return project.shareConfig;
}

function weChatShare(opts = {}, customConfig = {}) {
  const client = getClient();
  const shareConfig = handleShareConfig(opts, customConfig);
  // 选择了外部分享组件
  addShareTriggerToWidget(shareConfig);
  if (client !== 'wx') return;
  const project = previewStore.getProject();
  const successCallback = () => {
    shareConfig.menuItem.forEach((item) => {
      window.wx[item]({
        title: shareConfig.title,
        link: shareConfig.link,
        desc: shareConfig.desc,
        imgUrl: shareConfig.imgUrl,
        success: shareConfig.success
          ? shareConfig.success.bind(this, item)
          : (shareType) => {
              sendClickLog({
                clickid: 'share_success',
                action: '分享',
                sharetype: shareType,
                projectid: project._id,
                originhref: `${god.location.origin}${god.location.pathname}`,
                status: 1,
              });
            },
        cancel: shareConfig.cancel
          ? shareConfig.cancel.bind(this, item)
          : (shareType) => {
              sendClickLog({
                clickid: 'share_fail',
                action: '分享',
                sharetype: shareType,
                projectid: project._id,
                originhref: `${god.location.origin}${god.location.pathname}`,
                status: 1,
              });
            },
      });
    });
  };
  applyWxConfig(successCallback);
}

function tPPShare(opts = {}, customConfig = {}) {
  let ua = navigator.userAgent;
  // 题拍拍客户端内
  if (!/QzSearch/.test(ua)) return;
  const shareConfig = handleShareConfig(opts, customConfig);
  loadScript(
    'https://static.tiku.100tal.com/xes_souti/assets/libs/jsbridge/dist.umd.js'
  ).then(function () {
    const params = {
      title: shareConfig.title,
      content: shareConfig.desc,
      icon: shareConfig.imgUrl,
      url: shareConfig.link,
      direct: false,
    };
    god.tppJsbridge.shareWeb(params);
  });
}

const getUseDataValue = (val) => {
  const project = previewStore.getProject();
  return useDataValue(
    val,
    project.pages[0].variableStore,
    project.pages[0],
    project
  );
};

const ensureProtocol = (url) => {
  return url
    .replace(/^http(s)?:/, location.protocol)
    .replace(/^\/\//, location.protocol + '//');
};
const mergeUrlQuery = (opts = {}, url = location.href) => {
  if (!/\/\//.test(url)) {
    url = location.href;
  } else {
    url = ensureProtocol(url);
  }
  // 当前项目链接
  let currentUrlQuery = qs.parse(location.search);
  let [shareUrl, shareUrlQuery] = url.split('?');
  // 合并权重，url上的参数 < 用户填写的地址上的参数 < 组件中自定义的参数
  Object.assign(currentUrlQuery, qs.parse(shareUrlQuery || {}), opts);
  const StringifiedQuery = qs.stringify(currentUrlQuery);
  return StringifiedQuery ? (shareUrl += '?' + StringifiedQuery) : shareUrl;
};
const addShareTriggerToWidget = (shareConfig) => {
  const client = getClient();
  if (shareConfig.shareWidget) {
    let shareWidget = getWidget(shareConfig.shareWidget) || {};
    // 蒙层展示只适用于站外
    if (shareConfig.showModal && shareConfig.modalWidget && client !== 'jzh') {
      shareWidget.addTrigger({
        event: 'click',
        type: 'ChangeWidget',
        data: {
          handleType: 'show',
          widget: shareConfig.modalWidget,
          widgetAttribute: '',
        },
      });
    } else if (
      shareConfig.showModal &&
      shareConfig.modalWidget &&
      client == 'jzh'
    ) {
      shareWidget.addTrigger({
        event: 'click',
        type: 'appShare',
        data: {
          appShareConfig: shareConfig,
          getUserInfo: shareConfig.getUserInfo,
        },
      });
    }
  }
};
let handleShareConfig = (opts = {}, customConfig = {}) => {
  const project = previewStore.getProject();
  let shareConfig = getShareConfig();
  // 处理数据容器获得的数据
  Object.keys(shareConfig).forEach((attribute) => {
    if (hasVariable(shareConfig[attribute])) {
      shareConfig[attribute] = getUseDataValue(shareConfig[attribute]);
    }
  });
  // 携带参数url上的参数和opts中传入的参数
  shareConfig.shareUrl = mergeUrlQuery(opts, shareConfig.shareUrl);
  // 是否携带用户信息
  let uid = localStorage.getItem('uid') || project.getPageDataByKey('uid');
  if (shareConfig.getUserInfo && uid) {
    shareConfig.shareUrl += /\?/.test(shareConfig.shareUrl)
      ? `&oldUserId=${uid}`
      : `?oldUserId=${uid}`;
  }
  // 合并customConfig用户传入的自定义配置
  const client = getClient();
  const newConfig = {};
  Object.assign(shareConfig, customConfig);
  if (client == 'jzh') {
    const { shareScence } = getShareScence(shareConfig.menuItem);
    Object.assign(newConfig, shareConfig, {
      shareType: shareConfig.shareType || 1, // 1.网页，2大图，3小程序
      title: shareConfig.shareTitle, // 分享标题
      description: shareConfig.shareContent || '', // 分享描述内容
      actionUrl: shareConfig.shareUrl, // 链接跳转url
      shareScence, // 分享渠道,二进制转换 000000 ~ 111111
      businessId: 2018, // 项目对于业务ID
      agentKey: '', // 项目日志自定义统计key
      isOneKeyShare:
        shareConfig.shareType === 3 && getPlantform() === 'android'
          ? true
          : false, // 是否一键分享
    });
  } else {
    // 其他分享配置
    Object.assign(newConfig, shareConfig, {
      title: shareConfig.shareTitle,
      link: shareConfig.shareUrl,
      desc: shareConfig.shareContent,
      imgUrl: shareConfig.shareImgUrl,
      menuItem: shareConfig.menuItem,
      modalWidget: shareConfig.modalWidget,
    });
  }
  return newConfig;
};
let goToShare = (opts = {}, customConfig = {}, cb = () => {}) => {
  const client = getClient();
  const shareConfig = handleShareConfig(opts, customConfig);
  if (client === 'jzh') {
    window.xesApp.appShareBack = cb;
    window.xesApp.start(
      'xesShare/share',
      JSON.stringify(shareConfig),
      'xesApp.appShareBack'
    );
    return;
  }
  let ua = navigator.userAgent;
  // 题拍拍客户端内
  if (/QzSearch/.test(ua)) {
    tPPShare(opts, customConfig);
    return;
  }
  if (client === 'wx') {
    weChatShare(opts, customConfig);
  }
  if (shareConfig.modalWidget) {
    let modalWidget = getWidget(shareConfig.modalWidget) || {};
    modalWidget.visible = true;
  }
};

export { weChatShare, tPPShare, goToShare };
