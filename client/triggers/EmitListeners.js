import emitter from 'common/event';
const config = {
  name: '触发组件监听器',
  type: 'EmitListeners',
  config: {
    listener: {
      type: 'ListenerSelect',
    },
  },
  run(ctx, next) {
    const { trigger } = ctx;
    const { data } = trigger;
    ctx.emmit(
      {
        listener: data.listener,
        data,
      },
      next
    );
    // 存在问题：如果页面内有两个同样的组件，都被触发了组件监听。todo：listername是否是widgetid+key做成唯一标示
    if (!emitter._events[data.listener]) {
      next();
    }
  },
};

export default config;
