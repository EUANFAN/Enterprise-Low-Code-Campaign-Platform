import React from 'react';
import ReactDOM from 'react-dom';
import CreateProjectModal from './createProjectModal';

// TODO: 把全局的 toastLayer，modalLayer 放置在同一个位置的引用
let container = null;
const modalRef = React.createRef();

export default function createProject(options, success, fail) {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }

  function init() {
    ReactDOM.render(<CreateProjectModal ref={modalRef} />, container);
  }

  if (modalRef && modalRef.current) {
    modalRef.current.show(options, success, fail);
  } else {
    init();
    modalRef.current.show(options, success, fail);
  }
}
