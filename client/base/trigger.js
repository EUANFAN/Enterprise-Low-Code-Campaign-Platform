import { WIDGET_EVENT } from 'common/constants';

export default {
  client: {
    text: '客户端',
    type: 'CheckBox',
    options: []
  },
  platform: {
    text: '平台',
    type: 'CheckBox',
    options: [
      {
        text: 'iOS',
        value: 'iOS'
      },
      {
        text: 'android',
        value: 'android'
      },
      {
        text: '其它',
        value: 'other'
      }
    ]
  },
  event: {
    text: '事件',
    type: 'Select',
    options: [],
    placeholder: '选择触发时机',
    handler(type, index) {
      if (type == 'project') {
        return [
          {
            text: '加载完成',
            value: 'load'
          },
          {
            text: '滚到底部',
            value: 'scrollBottom'
          }
        ];
      } else if (type == 'page') {
        let action = [
          {
            text: '进入页面',
            value: 'enter'
          },
          {
            text: '离开页面',
            value: 'leave'
          },
          {
            text: '页面加载前',
            value: 'willmount'
          }
        ];
        if (index != 0) {
          action.push({
            text: '回退',
            value: 'back'
          });
        }
        return action;
      } else if (type == 'widget') {
        return WIDGET_EVENT;
      }
      return [];
    }
  },
  showCount: {
    text: '触发次序',
    type: 'Radio',
    value: false,
    msg: '无限次表示在每次执行事件都会被触发；指定次序表示在第几次执行事件时被触发',
    options: [
      { text: '无限次', value: false },
      { text: '指定次序', value: true }
    ]
  },
  count: {
    text: '次数',
    type: 'Slider',
    min: 1,
    max: 10,
    when(trigger) {
      return trigger.showCount;
    }
  },
  type: {
    text: '动作',
    type: 'Select',
    placeholder: '请选择动作',
    showSearch: true,
    options: []
  }
};
