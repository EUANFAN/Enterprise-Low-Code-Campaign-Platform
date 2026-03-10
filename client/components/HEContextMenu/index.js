import './index.less';

import React from 'react';
import ReactDOM from 'react-dom';
import { Icon } from 'antd';

class Menu extends React.Component {
  render() {
    let { items, onClick } = this.props;
    return (
      <div className="context-menu-list">
        {items.map(function (item) {
          let { key, icon, disabled, text } = item;
          let className = disabled ? 'disabled' : '';

          return (
            <div
              key={key}
              onClick={(e) => {
                onClick(e, key);
              }}
              className={'context-menu-item ' + className}
            >
              <Icon type={icon} />
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    );
  }
}

export default class ContextMenu {
  constructor(options) {
    this.options = Object.assign(
      {
        pageX: 0,
        pageY: 0,
        items: [],
      },
      options
    );
    this.render();
  }

  render() {
    let me = this;
    let options = this.options;

    let ele = (this.ele = this.createElement('div', {
      class: 'context-menu-content',
    }));
    let mask = (this.mask = this.createElement('div', {
      class: 'context-menu-mask',
    }));

    ele.style.left = options.pageX + 10 + 'px';
    ele.style.top = options.pageY + 10 + 'px';

    ReactDOM.render(
      <Menu onClick={options.onClick} items={options.items} />,
      ele
    );

    mask.addEventListener('mousedown', function () {
      me.destroy();
    });

    ele.addEventListener('click', function () {
      setTimeout(function () {
        me.destroy();
      });
    });
  }
  destroy() {
    if (!this.ele) {
      return;
    }
    ReactDOM.unmountComponentAtNode(this.ele);
    this.ele.remove();
    this.mask.remove();
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
