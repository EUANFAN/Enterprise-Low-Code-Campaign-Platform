export default {
  name: '显示弹窗',
  type: 'Alert',
  // 设置触发器执行顺序，之后，99是最大值，值越大，越先执行，没有则为0，优先级排序为稳定排序
  priority: 99,
  data: {
    title: '',
    info: '',
    btnText: '',
    btnAction: '',
  },
  config: {
    title: {
      type: 'NormalText',
      text: '标题文案',
    },
    info: {
      type: 'NormalText',
      text: '内容文案',
    },
    btnText: {
      type: 'NormalText',
      text: '按钮文案',
    },
    btnAction: {
      type: 'TriggerSelect',
      text: '按钮行为',
    },
  },

  run(ctx, next) {
    let data = ctx.trigger.data;
    ctx.showAlert({
      title: data.title,
      info: data.info,
      btnText: data.btnText,
      btnAction: ctx.trigger.btnAction,
    });
    next();
  },
};
