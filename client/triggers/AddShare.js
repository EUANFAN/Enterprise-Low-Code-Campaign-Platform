export default {
  // 行为类型，这个组件的唯一标识
  type: 'AddShare',

  // 行为名称，显示在行为选择框中的内容
  name: '点击触发分享',

  // 组件分类：
  // 分为两种分类: action(行为) 和 widget(ui组件)
  // 初始化时确定，请务必不要修改
  category: 'action',
  showCondition: ['widget'], // 展现条件 page表示在页面行为中展示 widget表示在组件行为中展示
  // 可视化配置参数，当选择了当前行为后，出现在行为选择框之下
  // 配置类型分为：
  //     Set(key-value集合)
  //     Checkbox(多选)
  //     ColorPicker(颜色选择)
  //     FilePicker(文件选择)
  //     NormalText(普通文本)
  //     RichText(富文本)
  //     Select(下拉选择)
  //     Slider(滑块-可拖动调整数值)
  //     Radio(单选)
  //     Radio(单选-按钮形式)
  //     WidgetSelector
  config: {
    getUserInfo: {
      text: '用户信息',
      msg: '分享url带上当前用户信息',
      type: 'Radio',
      value: false,
      options: [
        { text: '是', value: true },
        { text: '否', value: false },
      ],
    },
  },
  data: {
    getUserInfo: false,
  },
  run: function (ctx, next) {
    let opts = {};
    if (ctx.trigger.data.getUserInfo) {
      opts = {
        userId: ctx.localStorage.getItem('uid'),
      };
    }
    ctx.goToShare(opts);
    next();
  },
};
