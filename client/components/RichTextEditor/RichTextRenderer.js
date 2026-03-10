import React from 'react';
import HtmlSerializer from 'slate-html-serializer';
import {
  NumberListItem,
  AlphabetListItem,
  CircleListItem,
} from './plugins/List/ListItem.js';

import {
  RichTextClasses,
  Marks,
  ListTypes,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_LIST_INDENT,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_WEIGHT,
} from './constants';

const BLOCK_CLASS_LOOKUP = {
  [RichTextClasses.PARAGRAPH]: 'paragraph',
};

const MARK_CLASS_LOOKUP = {
  [RichTextClasses.MARK__FONT_SIZE]: Marks.FONT_SIZE,
  [RichTextClasses.MARK__FONT_WEIGHT]: Marks.FONT_WEIGHT,
  [RichTextClasses.MARK__FONT_FAMILY]: Marks.FONT_FAMILY,
  [RichTextClasses.MARK__BACKGROUND_COLOR]: Marks.BACKGROUND_COLOR,
  [RichTextClasses.MARK__TEXT_COLOR]: Marks.TEXT_COLOR,
};

const ListItem = (props) => {
  const { listType, ...others } = props;
  const Tag =
    listType === 'number'
      ? NumberListItem // eslint-disable-line
      : listType === 'alphabet'
      ? AlphabetListItem // eslint-disable-line
      : listType === 'circle'
      ? CircleListItem // eslint-disable-line
      : null; // eslint-disable-line
  if (!Tag) {
    return null;
  }

  return <Tag {...others} />;
};

function blockDeserializer(el, next) {
  const blockType = BLOCK_CLASS_LOOKUP[el.className];
  if (blockType) {
    return {
      object: 'block',
      type: blockType,
      nodes: next(el.childNodes),
    };
  }
}

function blockSerializer(node, children) {
  if (node.object !== 'block') {
    return;
  }

  switch (node.type) {
    case ListTypes.ORDERED_LIST:
    case ListTypes.UNORDERED_LIST: {
      const nodeData = node.data;
      const indent = nodeData.get('indent');

      return (
        <div
          className={RichTextClasses.LIST}
          style={{ paddingLeft: indent != null ? indent : DEFAULT_LIST_INDENT }}
        >
          {React.Children.map(children, (child, index) => {
            return React.cloneElement(child, {
              index,
              listType: nodeData.get('type'),
              decoratorSize: nodeData.get('decoratorSize'),
              padding: nodeData.get('padding'),
            });
          })}
        </div>
      );
    }
    case ListTypes.LIST_ITEM: {
      // NOTE ListItem 的 props 包含 index 和 listType 并不是在这里传入，而是在
      // List 上透过 cloneElement 来得到的。
      return <ListItem node={node}>{children}</ListItem>;
    }
    case 'paragraph': {
      let fontSize;
      const { data } = node;
      if (node.isLeafBlock()) {
        // 如果用户用 Mark 的方式设定了字体大小和行高，并无法影响到最外层组件（下方的 div）
        // ，造成在字体比预设大小小时出现问题（高度与字体不一致）。因此这里主动检查所有子元素
        // 都小于预设值，若正确，则我们设置为子元素的最大值
        //
        // NOTE 这里之所以只在 Leaf Block 检查是因为避免无效运算
        const maxSize = node
          .getMarks()
          .reduce(
            (prev, curr) =>
              Math.max(prev, curr.data.get('fontSize') || DEFAULT_FONT_SIZE),
            DEFAULT_FONT_SIZE
          );

        fontSize = Math.min(maxSize, DEFAULT_FONT_SIZE);
      }

      return (
        <div
          className={RichTextClasses.PARAGRAPH}
          style={{
            fontSize: fontSize,
            textAlign: data.get('textAlign') || DEFAULT_TEXT_ALIGN,
            lineHeight: data.get('lineHeight') || DEFAULT_LINE_HEIGHT,
          }}
        >
          {children}
        </div>
      );
    }
  }
}

function markDeserializer(el, next) {
  const blockType = MARK_CLASS_LOOKUP[el.className];
  if (blockType) {
    return {
      object: 'mark',
      type: blockType,
      nodes: next(el.childNodes),
    };
  }
}

function markSerializer(node, children) {
  if (node.object !== 'mark') {
    return;
  }
  let className;

  switch (node.type) {
    case Marks.FONT_FAMILY:
      className = RichTextClasses.MARK__FONT_FAMILY;
      break;
    case Marks.FONT_WEIGHT:
      className = RichTextClasses.MARK__FONT_WEIGHT;
      break;
    case Marks.FONT_SIZE:
      className = RichTextClasses.MARK__FONT_SIZE;
      break;
    case Marks.TEXT_COLOR:
      className = RichTextClasses.MARK__TEXT_COLOR;
      break;
    case Marks.BACKGROUND_COLOR:
      className = RichTextClasses.MARK__BACKGROUND_COLOR;
      break;
  }
  const { data } = node;

  return (
    <span className={className} style={data.toJS()}>
      {children}
    </span>
  );
}

const rules = [
  {
    deserialize: blockDeserializer,
    serialize: blockSerializer,
  },
  {
    deserialize: markDeserializer,
    serialize: markSerializer,
  },
  {
    serialize: (node) => {
      if (node.object === 'string' && !node.text) {
        // 如果为空字串，会因为内部没有东西而导致 Div 大小为 0 ，效仿 slate 在这
        // 里渲染一个空的符号
        return <span>{String.fromCharCode(8203)}</span>;
      }
      return node.text;
    },
  },
];

const htmlSerializer = new HtmlSerializer({ rules });

const RichTextRenderer = React.forwardRef((props, ref) => (
  <div
    ref={ref}
    className="h5-rich-text-renderer"
    style={{
      textAlign: DEFAULT_TEXT_ALIGN,
      fontSize: DEFAULT_FONT_SIZE,
      lineHeight: DEFAULT_LINE_HEIGHT,
      fontFamily: `${DEFAULT_FONT_FAMILY}-${DEFAULT_FONT_WEIGHT}`,
    }}
  >
    {htmlSerializer.serialize(props.value, { render: false })}
  </div>
));
RichTextRenderer.displayName = 'RichTextRenderer';
export default RichTextRenderer;
