import React from 'react';
import ReactDOM from 'react-dom';

export default class ModalTool {
  isMounted = false;
  visible = false;
  constructor() {
    this.eleId = 'common-modal-' + Date.now();
  }

  render(Component, props) {
    let ele = this.createElement('div', {});
    this.ele = ele;
    ReactDOM.render(<Component {...props} />, ele);

    this.isMounted = true;
  }
  isVisible() {
    return this.visible;
  }
  show() {
    this.ele.style.display = '';
    this.visible = true;
  }
  hide() {
    this.ele.style.display = 'none';
    this.visible = false;
  }
  destroy() {
    if (!this.ele) {
      return;
    }
    ReactDOM.unmountComponentAtNode(this.ele);
    this.ele.remove();
  }

  createElement(tag, options) {
    let ele = document.createElement(tag);
    for (let pro of Object.keys(options)) {
      ele.setAttribute(pro, options[pro]);
    }

    document.body.appendChild(ele);
    return ele;
  }
}
