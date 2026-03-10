import { AnimateChangeVisible } from 'common/utils';
export default {
  name: '修改组件属性',
  type: 'ChangeWidget',

  data: {
    widget: '',
    handleType: 'toggle',
    widgetAttribute: ''
  },

  config: {
    widget: {
      text: '组件',
      type: 'WidgetSelect'
    },
    handleType: {
      text: '处理方式',
      type: 'Select',
      value: 'toggle',
      options: [
        {
          text: '隐藏/显示切换',
          value: 'toggle'
        },
        {
          text: '隐藏',
          value: 'hide'
        },
        {
          text: '显示',
          value: 'show'
        },
        {
          text: '自定义属性',
          value: 'custom'
        },
        {
          text: '自定义属性切换',
          value: 'customToggle'
        }
      ]
    },

    widgetAttribute: {
      text: '组件属性',
      type: 'WidgetAttribute',
      // widget(trigger) {
      //   return trigger.data.widget;
      // },
      when(trigger) {
        return (
          trigger.data.handleType == 'customToggle' ||
          trigger.data.handleType == 'custom'
        );
      }
    }
  },

  run(ctx, next) {
    let data = ctx.trigger.data;
    let widget = ctx.getWidget(data.widget);
    if (widget) {
      if (data.handleType == 'toggle') {
        AnimateChangeVisible(widget, !widget.visible);
      } else if (data.handleType == 'hide') {
        AnimateChangeVisible(widget, false);
      } else if (data.handleType == 'show') {
        AnimateChangeVisible(widget, true);
      } else if (
        data.handleType == 'customToggle' &&
        data.widgetAttribute &&
        data.widgetAttribute.type &&
        data.widgetAttribute.key &&
        data.widgetAttribute.value
      ) {
        let widgetData = widget;
        let { type, key, value } = data.widgetAttribute;

        if (type == 'data') {
          widgetData = widget.data;
        }
        widgetData['origin'] = widgetData['origin'] || {};

        if (!widgetData['origin'][key]) {
          widgetData['origin'][key] = widgetData[key];
        }
        widgetData[key] =
          widgetData['origin'][key] == widgetData[key]
            ? value
            : widgetData['origin'][key];
      } else if (
        data.handleType == 'custom' &&
        data.widgetAttribute &&
        data.widgetAttribute.type &&
        data.widgetAttribute.key &&
        data.widgetAttribute.value
      ) {
        let widgetData = widget;
        let { key, type, value } = data.widgetAttribute;
        if (type === 'data') {
          widgetData = widget.data;
        }
        widgetData[key] = value;
      }
    }

    next();
  }
};
