import './index.less';
import classNames from 'classnames';
import React from 'react';
import tools from 'common/tools';
import { px2rem } from 'utils/ModelUtils';
import getAncestor from 'common/getAncestor';

export default {
  name: '普通文本',
  type: 'NormalText',
  category: 'Text',
  group: 'Text',
  height: 30,
  icon: 'edit',
  data: {
    content: '',
    color: '#333',
    fontSize: 16,
    fontWeight: 'normal',
    verticalAlign: 'middle',
    horizontalAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0,
    needEllipsis: false,
    autoHeight: true,
    rowSpliters: [],
    advancedSettings: false,
    textDecoration: 'none'
  },

  config: {
    content: {
      text: '内容',
      type: 'NormalText',
      style: 'area',
      useData: true
    },
    color: {
      text: '字体颜色',
      type: 'ColorPicker'
    },

    fontSize: {
      text: '字体大小',
      type: 'Slider',
      min: 0,
      max: 100
    },

    fontWeight: {
      text: '字体粗细',
      type: 'Select',
      options: [
        {
          value: 'lighter',
          text: '细体'
        },
        {
          value: 'normal',
          text: '常规'
        },
        {
          value: 'bolder',
          text: '加粗'
        }
      ]
    },

    needEllipsis: {
      text: '超长截断',
      msg: '太长了截断',
      type: 'Radio',
      options: [
        {
          text: '是',
          value: true
        },
        {
          text: '否',
          value: false
        }
      ]
    },

    letterSpacing: {
      text: '字间距',
      type: 'Slider',
      min: 0,
      max: 100
    },
    lineHeight: {
      text: '行高',
      type: 'Slider',
      min: 0,
      max: 200
    },
    autoHeight: {
      text: '自动调整高度',
      type: 'Radio',
      options: [
        {
          text: '是',
          value: true
        },
        {
          text: '否',
          value: false
        }
      ]
    },

    verticalAlign: {
      text: '垂直对齐',
      type: 'Radio',
      options: [
        {
          text: '顶部',
          value: 'top'
        },
        {
          text: '中部',
          value: 'middle'
        },
        {
          text: '底部',
          value: 'bottom'
        }
      ]
    },
    horizontalAlign: {
      text: '水平对齐',
      type: 'Radio',
      options: [
        {
          text: '居左',
          value: 'left'
        },
        {
          text: '居中',
          value: 'center'
        },
        {
          text: '居右',
          value: 'right'
        }
      ]
    },

    advancedSettings: {
      type: 'Radio',
      text: '高级选项',
      options: [
        { text: '打开', value: true },
        { text: '隐藏', value: false }
      ],
      value: false
    },
    textDecoration: {
      text: '文本修饰',
      type: 'Select',
      value: 'none',
      options: [
        {
          text: '标准文本',
          value: 'none'
        },
        {
          text: '下划线',
          value: 'underline'
        },
        {
          text: '上划线',
          value: 'overline'
        },
        {
          text: '穿过文本',
          value: 'line-through'
        }
      ],
      when: (t) => t.data.advancedSettings
    },
    rowSpliters: {
      when: (t) => t.data.advancedSettings,
      text: '换行分隔符',
      type: 'AssembleList',
      minCount: 0,
      itemTitle: '分隔符',
      fields: {
        key: {
          text: '',
          type: 'NormalText',
          value: ','
        }
      }
    }
  },

  onUpdated(ctx) {
    const { widget, widgetRef, project, useDataValue, variableMap, page } = ctx;
    const {
      data: { autoHeight, content: contentSrc }
    } = widget;
    const widgetElement = widgetRef.current;
    let content = useDataValue(contentSrc, variableMap, page, project);
    if (!autoHeight || !widgetElement) {
      return;
    }
    let height;
    // 这里有问题，获取的是左侧侧边栏文本的高度，经过了缩放
    if (getAncestor(widgetElement, 'workspace')) {
      height = widgetElement.getBoundingClientRect().height;
    } else {
      height = widget.height;
    }
    if (content.toString().trim().length !== 0) {
      // WARNING: 设置完 height 后会触发 UI 再次更新。由于再次更新时新的 height 会和
      // 旧的 height 一样，因此不会造成无限循环
      let struct = tools.getPaddingStruct(widget.padding);
      let currentHeight = height + struct.top + struct.bottom;
      if (widget.height != currentHeight) {
        widget.height = currentHeight;
      }
    }
  },
  // TODO Remove React and use Vue
  onRender(ctx) {
    const { widget, project, widgetRef, useDataValue, variableMap, page } = ctx;
    const { data } = widget;
    let content = useDataValue(data.content, variableMap, page, project) || '';
    const autoHeight = data.autoHeight;
    const {
      color,
      textDecoration,
      fontSize,
      verticalAlign,
      horizontalAlign,
      lineHeight,
      letterSpacing,
      needEllipsis,
      fontWeight
    } = data;
    if (typeof content !== 'string') {
      content = `${content}`;
    }

    const className = classNames(
      [
        'widget-normal-text',
        `align-${verticalAlign}`,
        `align-${horizontalAlign}`
      ],
      {
        'normaltext-need-ellipsis': needEllipsis,
        'widget-normal-text--auto-height': autoHeight
      }
    );

    // 此处已经把 fontSize 和 lineHeight / 2 的设定去掉
    const magicNum = 1;
    const minHeight =
      lineHeight <= fontSize * magicNum ? fontSize * magicNum : lineHeight;
    const textStyle = {
      color: color,
      lineHeight: `${lineHeight}px`,
      fontSize: fontSize,
      fontWeight: fontWeight,
      letterSpacing: `${letterSpacing}px`,
      minHeight: `${minHeight}px`,
      textDecoration: textDecoration
    };
    px2rem(textStyle);
    const innerText = content
      ? parseContent(
          content,
          data.rowSpliters.map((i) => i.key).filter((i) => i?.length)
        )
      : '文本内容';

    return (
      <div
        ref={widgetRef}
        className={className}
        style={textStyle}
        dangerouslySetInnerHTML={{ __html: innerText }}
      ></div>
    );
  }
};

function parseContent(content, spliters) {
  let _content = content;
  if (spliters.length) {
    for (const spliter of spliters) {
      _content = _content.replace(new RegExp(spliter, 'g'), '<br />');
    }
  }
  return _content.replace(/\n/g, '<br />').replace(/^\s+|\s+$/gm, '');
}
