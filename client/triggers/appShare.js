export default {
  name: 'app分享功能',
  type: 'appShare',
  data: {},
  config: {},
  showCondition: [],
  run(ctx, next) {
    const data = ctx.trigger.data;
    if (data.getUserInfo) {
      let uid = ctx.localStorage.getItem('uid');
      data.appShareConfig.actionUrl += /\?/.test(data.appShareConfig.actionUrl)
        ? `&userId=${uid}`
        : `?userId=${uid}`;
    }
    window.xesApp.start(
      'xesShare/share',
      JSON.stringify(data.appShareConfig),
      'xesApp.appShareBack'
    );
    ctx.sendClickLog({
      clickid: 'appshare',
    });
    next();
  },
};
