import React, { Component } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';

// 搜索
import 'codemirror/addon/search/matchesonscrollbar.js';
import 'codemirror/addon/search/match-highlighter.js';
import 'codemirror/addon/search/jump-to-line.js';
import 'codemirror/addon/dialog/dialog.js';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/searchcursor.js';
import 'codemirror/addon/search/search.js';
// 导入语言类型\n//

import './index.less';

export default class Editor extends Component {
  static defaultProps = {
    value: '',
    onChange: () => {}
  };
  render() {
    const { value } = this.props;
    return (
      <CodeMirror
        value={value}
        lazyLoadMode={false}
        options={{
          autoCloseBrackets: true,
          theme: 'monokai',
          tabSize: 2,
          keyMap: 'sublime',
          mode: 'js',
          lineWrapping: true,
          foldGutter: true,
          gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
        }}
        autoFocus={true}
        onChange={(editor) => {
          const value = editor.getValue();
          this.props.onChange(value);
        }}
      />
    );
  }
}
