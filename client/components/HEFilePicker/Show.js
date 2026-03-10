import React from 'react';
import ReactDOM from 'react-dom';
import HEFilePicker from './HEFilePicker';

let container = null;
const filePicker = React.createRef();

// HEFilePicker 的自动实例化
export default function HEFilePickerShow(ok, cancel, options) {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }

  function close() {}
  function update() {}
  function destroy() {}

  function render() {
    ReactDOM.render(<HEFilePicker ref={filePicker} />, container);
  }

  function show() {
    filePicker.current.show(ok, cancel, options);
  }

  if (filePicker && filePicker.current) {
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
