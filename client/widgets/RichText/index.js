import './index.less';
import React from 'react';
import { afterUpdateHook, beforeUpdateHook } from 'common/attributeHook';
export default {
  name: '富文本',
  type: 'RichText',
  category: 'Text',
  group: 'Text',
  icon: 'edit',
  padding: '0 0 0 0',
  data: {
    content: '',
    autoHeight: true,
  },
  config: {
    content: {
      text: '内容',
      type: 'RichText',

      useData: true,
    },
    autoHeight: {
      text: '自动调整高度',
      type: 'Radio',
      options: [
        {
          text: '是',
          value: true,
        },
        {
          text: '否',
          value: false,
        },
      ],
    },
  },

  onEnter(ctx) {
    let widget = ctx.widget;
    let data = widget.data;
    return new Promise((resolve) => {
      ctx.open(
        'RichTextEditor',
        data.content,
        async (content) => {
          await widget.modify(
            {
              content: content.content,
            },
            'data'
          );
          let computedAttribute = await beforeUpdateHook(
            widget,
            'content',
            content.content,
            'data'
          );
          widget.data.content = content.content;
          await widget.modify({
            height: computedAttribute.height,
          });
          afterUpdateHook(widget, 'height', null, 'height');
          resolve(true);
        },
        () => {
          resolve(false);
        }
      );
    });
  },
  onRender(ctx) {
    const { widget, project, useDataValue, variableMap, page } = ctx;
    let html = useDataValue(widget.data.content, variableMap, page, project);
    // px2rem
    html = html.replace(/(\d+)(px)/g, (match, p1) => {
      return (p1 / 37.5).toFixed(2) + 'rem';
    });
    return (
      <div className="widget-text" dangerouslySetInnerHTML={{ __html: html }} />
    );
  },
  onNext(ctx) {
    let widget = ctx.widget;
    return ctx.open(
      'RichTextEditor',
      widget.data.content,
      async (value) => {
        widget.data.content = value.content;
        let computedAttribute = await beforeUpdateHook(
          widget,
          'content',
          value.content,
          'data'
        );
        await widget.modify({
          height: computedAttribute.height,
        });
        afterUpdateHook(widget, 'height', null, 'height');
        return true;
      },
      (err) => {
        console.log('err', err);
        return false;
      }
    );
  },
};
