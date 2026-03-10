export default {
  name: '弹出提示',
  type: 'Toast',
  // 设置触发器执行顺序，之后，99是最大值，值越大，越先执行，没有则为0，优先级排序为稳定排序
  priority: 99,
  data: {
    message: '', //	String	是		提示框提示的内容
    duration: 3000, //	Number	否	3000	提示的延迟时间，单位为毫秒
  },
  config: {
    message: {
      type: 'NormalText',
      text: '提示文案',
      msg: '提示框提示的内容',
    },
    duration: {
      type: 'InputNumber',
      text: '提示时长',
      value: 1500,
      min: 0,
      max: 30000,
      step: 100,
      msg: '提示的延迟时间，单位为毫秒',
    },
  },

  run(ctx, next) {
    let data = ctx.trigger.data;
    ctx.showToast({
      message: data.message,
      duration: data.duration,
    });
    next();
  },
};
