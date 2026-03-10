import React from 'react';
import ReactDOM from 'react-dom';
import RichTextEditor from './RichTextEditor';
import VariablePicker from '../HEVariablePicker';
import { hasVariable } from 'utils/ModelUtils';
import store from 'store/stage';
let container = null;
const _richText = React.createRef();

// richTextEditor 的自动实例化
export default function RichTextEditorShow(content, ok, cancel) {
  const isPageVariable = hasVariable(content);
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }

  function close() {}
  function update() {}
  function destroy() {}

  function render() {
    if (isPageVariable) {
      let stageStore = store.getStageStore();
      let project = stageStore.getProject();
      ReactDOM.render(
        <VariablePicker useToolbar={true} project={project} ref={_richText} />,
        container
      );
    } else {
      ReactDOM.render(<RichTextEditor ref={_richText} />, container);
    }
  }

  function show() {
    _richText.current.show(content, ok, cancel);
  }

  if (_richText && _richText.current) {
    show();
  } else {
    render();
    setTimeout(show);
  }
  // 预留给函数引用的接口
  return {
    close,
    destroy,
    update,
  };
}
