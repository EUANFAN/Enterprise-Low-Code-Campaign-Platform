export default {
  name: '改动页内变量',
  type: 'ModifyPageState',
  data: {
    target: '',
    stateType: '',
    stateValue: '',
    success: 'none',
  },
  config: {
    target: {
      text: '变量名称',
      type: 'PageStateControl',
    },
    stateType: {
      text: '变量类型',
      type: 'PageStateTypeControl',
      when(trigger) {
        return trigger.data.target;
      },
    },
    stateValue: {
      text: '变量内容',
      type: 'NormalText',
      msg: '请根据根据变量类型输入变量的值',
      useData: true,
      when(trigger) {
        return trigger.data.target;
      },
    },
    success: {
      type: 'TriggerSelect',
      text: '成功后行为',
      value: 'none',
    },
  },
  async run(ctx, next) {
    const { trigger, useDataValue, variableMap, project, page } = ctx;
    const data = trigger.data;
    let { target, stateType } = data;
    let stateValue =
      useDataValue(data.stateValue, variableMap, page, project) || '';
    if (target && stateType && stateValue != undefined) {
      switch (stateType) {
        case 'Boolean':
          stateValue = Boolean(stateValue);
          break;
        case 'Number':
          stateValue = Number(stateValue);
          break;
        default:
          break;
      }
      ctx.setPageData(target, stateValue);
    }
    if (trigger.success != 'none') {
      await ctx.runAction(trigger.success, ctx);
    }
    next();
  },
};
