import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Mark, Data } from 'slate';
import { Map } from 'immutable';
import './index.less';

import ListPlugin, { utils, changes } from './plugins/List/ListPlugin';
import Toolbar from './Toolbar/index.js';

import {
  INITIAL_STATE,
  DEFAULT_TEXT_ALIGN,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_WEIGHT,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_FONT_SIZE,
  DEFAULT_COLOR_ALPHA,
  DEFAULT_BACKGROUND_COLOR_ALPHA,
  DEFAULT_LIST_DECORATOR_SIZE,
  DEFAULT_LIST_INDENT,
  DEFAULT_LIST_PADDING,
} from './constants';

const Plugins = [ListPlugin];

const TAB_SPACES = '    ';
const FontSizes = [10, 12, 16, 18, 24, 28, 32, 48, 56, 64, 72, 96];
const LineHeights = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2];

const Fonts = {
  PingFangSC: {
    name: '苹方',
    fontFamily: 'PingFangSC',
    weights: {
      Ultralight: { weight: 'Ultralight', name: '极细' },
      Thin: { weight: 'Thin', name: '纤细' },
      Light: { weight: 'Light', name: '细体' },
      Regular: { weight: 'Regular', name: '常规' },
      Medium: { weight: 'Medium', name: '中黑' },
      Semibold: { weight: 'Semibold', name: '中粗' },
    },
  },
};

const Span = (props) => {
  const { mark } = props;

  return (
    <span
      className="h5-rich-text-mark"
      {...props.attributes}
      style={mark.data.toJS()}
    >
      {props.children}
    </span>
  );
};

const Paragraph = (props) => {
  const { node } = props;
  const { data } = node;
  let fontSize;

  if (node.isLeafBlock()) {
    // 如果用户用 Mark 的方式设定了字体大小和行高，并无法影响到最外层组件（下方的 div）
    // ，造成在字体比预设大小小时出现问题（高度与字体不一致）。因此这里主动检查所有子元素
    // 都小于预设值，若正确，则我们设置为子元素的最大值
    //
    // NOTE 这里之所以只在 Leaf Block 检查是因为避免无效运算
    const maxSize = props.node.getMarks().reduce((prev, curr) => {
      return Math.max(
        prev,
        curr.data.get('fontSize') || Number.MIN_SAFE_INTEGER
      );
    }, Number.MIN_SAFE_INTEGER);

    fontSize = Math.min(maxSize, DEFAULT_FONT_SIZE);
  }

  return (
    <div
      className="h5-rich-text-paragraph"
      {...props.attributes}
      style={{
        fontSize: fontSize,
        textAlign: data.get('textAlign') || DEFAULT_TEXT_ALIGN,
        lineHeight: data.get('lineHeight') || DEFAULT_LINE_HEIGHT,
      }}
    >
      {props.children}
    </div>
  );
};

const Marks = {
  FONT_FAMILY: 'font-family',
  FONT_WEIGHT: 'font-weight',
  FONT_SIZE: 'font-size',
  TEXT_COLOR: 'text-color',
  BACKGROUND_COLOR: 'background-color',
};

function createChangeHandler(tag, ...keys) {
  return function (change, ...values) {
    const data = {};

    for (let i = 0; i < keys.length; i++) {
      data[keys[i]] = values[i];
    }
    const { document, selection } = change.value;
    const tagMarks = document
      .getMarksAtRange(selection)
      .filter((mark) => mark.type === tag);

    let changes = change;

    tagMarks.forEach((mark) => {
      changes = changes.removeMark(mark);
    });
    changes.addMark(
      Mark.create({
        type: tag,
        data: Data.create(data),
      })
    );
  };
}

export default class RichTextEditor extends Component {
  static defaultProps = {
    value: INITIAL_STATE,
    autoFocus: true,
    readOnly: false,
  };

  _editor;

  constructor(props) {
    super(props);

    this._editor = React.createRef();
    this.state = { error: null };
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this._editor.current.focus();
    }
  }

  _setFontFamily = createChangeHandler('font-family', 'fontFamily');
  _setFontWeight = createChangeHandler('font-weight', 'fontWeight');
  _setFontSize = createChangeHandler('font-size', 'fontSize');
  _setTextColor = createChangeHandler('text-color', 'color', 'colorAlpha');
  _setBackgroundColor = createChangeHandler(
    'background-color',
    'backgroundColor',
    'backgroundColorAlpha'
  );

  _setAlign = (change, align) => {
    change.call(this._setBlockStyle, { textAlign: align });
  };

  _setBlockStyle = (change, newProperty) => {
    let currentChange = change;
    const {
      value: { document, selection },
    } = change;
    const blocks = document.getBlocksAtRange(selection);

    blocks.forEach((block) => {
      const blockData = block.data || Map();

      currentChange = currentChange
        .moveToRangeOf(block)
        .setBlocks({ data: blockData.mergeDeep(newProperty) });
    });

    currentChange.select(selection);
  };

  // NOTE 当用户有多行文案，且选择多行输入中午呢取代时，因为 DOM 会先更新而 Slate 在
  // composition 态，因此要等到结束后才会更新，造成 Slate 找不到需要删除的 DOM ，因而报
  // 错。这里就是处理这个问题。当取代发生时，就直接删除 DOM 并更新 value 来维持数据与 DOM
  // 一致
  _handleCompositionStart = () => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      const { selection } = change.value;
      change.insertText('').select(selection.collapseToStart());
    });
  };

  _handleListDecoratorSizeChange = (newValue) => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change.call(changes.setCurrentList, {
        decoratorSize: parseFloat(newValue),
      });
    });
  };

  _handleListPaddingChange = (newValue) => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change.call(changes.setCurrentList, { padding: parseFloat(newValue) });
    });
  };

  _handleListIndentChange = (newValue) => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change.call(changes.setCurrentList, { indent: parseFloat(newValue) });
    });
  };

  _handleFontFamilyChange = (newFontFamily) => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change.call(this._setFontFamily, newFontFamily).focus();
    });
  };

  _handleFontWeightChange = (newFontWeight) => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change.call(this._setFontWeight, newFontWeight);
    });
  };

  _handleFontSizeChange = (newFontSize) => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change.call(this._setFontSize, newFontSize).focus();
    });
  };

  _handleColorChange = (newProperty) => {
    const { color, alpha } = newProperty;
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change
        .call(this._setTextColor, color, alpha || DEFAULT_COLOR_ALPHA)
        .focus();
    });
  };

  _handleBackgroundColorChange = (newProperty) => {
    const { color, alpha } = newProperty;
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change
        .call(
          this._setBackgroundColor,
          color,
          alpha || DEFAULT_BACKGROUND_COLOR_ALPHA
        )
        .focus();
    });
  };

  _handleTextAlignChange = (event) => {
    const editorComponent = this._editor.current;

    editorComponent.change((change) => {
      change.call(this._setAlign, event.target.value).focus();
    });
  };

  _handleLineHeightChange = (newLineHeight) => {
    const editorComponent = this._editor.current;

    editorComponent.change(this._setBlockStyle, { lineHeight: newLineHeight });
  };

  _handleListClick = (event, listType, itemType) => {
    this._setListBlock(listType, itemType);
  };

  _setListBlock = (listType, itemType) => {
    const { value } = this.props;
    const list = utils.getCurrentList(value);
    const editorComponent = this._editor.current;
    const { unwrapList, wrapInList } = changes;

    editorComponent.change((change) => {
      if (!list) {
        change
          .call(wrapInList, listType, Data.create({ type: itemType }))
          .focus();
      } else if (list.data.get('type') === itemType) {
        change.call(unwrapList).focus();
      } else {
        change
          .call(unwrapList)
          .call(wrapInList, listType, Data.create({ type: itemType }))
          .focus();
      }
    });
  };

  _handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      const isInList = utils.isSelectionInList(this.props.value);
      if (!isInList) {
        event.preventDefault();
        const editorComponent = this._editor.current;
        editorComponent.change((change) => {
          change.insertText(TAB_SPACES);
        });
      }
    }
  };

  _renderMark = (props) => {
    switch (props.mark.type) {
      case Marks.FONT_FAMILY:
      case Marks.FONT_WEIGHT:
      case Marks.FONT_SIZE:
      case Marks.TEXT_COLOR:
      case Marks.BACKGROUND_COLOR:
        return <Span {...props} />;
    }
  };

  _renderNode = (props) => {
    const { node } = props;
    switch (node.type) {
      case 'paragraph':
        return <Paragraph {...props} />;
    }
  };

  render() {
    if (this.state.error) {
      return <div>Oops, something goes wrong</div>;
    }

    const { value, readOnly, onChange, style: propStyle } = this.props;
    const activeMarks = value.document.getActiveMarksAtRange(value.selection);
    const style = activeMarks.reduce((prev, curr) => {
      return prev.mergeDeep(curr.data);
    }, Map());
    const blocks = value.document.getBlocksAtRange(value.selection);
    const blockStyle = blocks.reduce((prev, curr) => {
      return prev.mergeDeep(curr.data);
    }, Map());
    const list = utils.getCurrentList(value);
    let listIndent, listDecoratorSize, listPadding;

    if (list) {
      listDecoratorSize = list.data.get('decoratorSize');
      listDecoratorSize =
        listDecoratorSize != null
          ? listDecoratorSize
          : DEFAULT_LIST_DECORATOR_SIZE;
      listIndent = list.data.get('indent');
      listIndent = listIndent != null ? listIndent : DEFAULT_LIST_INDENT;
      listPadding = list.data.get('padding');
      listPadding = listPadding != null ? listPadding : DEFAULT_LIST_PADDING;
    }

    return (
      <div
        className="rich-text-editor"
        style={propStyle}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        {!readOnly && (
          <Toolbar
            fonts={Fonts}
            fontSizes={FontSizes}
            lineHeights={LineHeights}
            fontFamily={style.get('fontFamily')}
            fontWeight={style.get('fontWeight')}
            fontSize={style.get('fontSize')}
            lineHeight={blockStyle.get('lineHeight')}
            textAlign={blockStyle.get('textAlign')}
            color={style.get('color')}
            colorAlpha={style.get('colorAlpha')}
            backgroundColor={style.get('backgroundColor')}
            backgroundColorAlpha={style.get('backgroundColorAlpha')}
            listIndent={listIndent}
            listDecoratorSize={listDecoratorSize}
            listPadding={listPadding}
            onFontFamilyChange={this._handleFontFamilyChange}
            onFontWeightChange={this._handleFontWeightChange}
            onFontSizeChange={this._handleFontSizeChange}
            onLineHeightChange={this._handleLineHeightChange}
            onTextAlignChange={this._handleTextAlignChange}
            onListClick={this._handleListClick}
            onColorChange={this._handleColorChange}
            onBackgroundColorChange={this._handleBackgroundColorChange}
            onListDecoratorSizeChange={this._handleListDecoratorSizeChange}
            onListIndentChange={this._handleListIndentChange}
            onListPaddingChange={this._handleListPaddingChange}
          />
        )}
        <Editor
          readOnly={readOnly}
          style={{
            textAlign: DEFAULT_TEXT_ALIGN,
            fontSize: DEFAULT_FONT_SIZE,
            lineHeight: DEFAULT_LINE_HEIGHT,
            fontFamily: `${DEFAULT_FONT_FAMILY}-${DEFAULT_FONT_WEIGHT}`,
          }}
          ref={this._editor}
          value={value}
          className="rich-text-editor__editor"
          onChange={onChange}
          onCompositionStart={this._handleCompositionStart}
          onKeyDown={this._handleKeyDown}
          plugins={Plugins}
          renderNode={this._renderNode}
          renderMark={this._renderMark}
        />
      </div>
    );
  }
}
