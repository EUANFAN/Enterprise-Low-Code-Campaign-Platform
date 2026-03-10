import './index.less';

import React from 'react';
import { Icon } from 'antd';

export default class MoveWidgetOperation extends React.Component {
  onClick = (clickOption, e) => {
    e.stopPropagation();
    const { options } = this.props;
    const { clickMethod } = options;
    clickMethod(clickOption);
  };
  render() {
    let { options } = this.props;
    const { index } = options;
    const upOptions = {
      oldIndex: index,
      newIndex: index - 1,
    };
    const downOptions = {
      oldIndex: index,
      newIndex: index + 1,
    };
    return (
      <div className="move-operation-content">
        {options.up && (
          <div
            className="move-arrow move-arrow-up"
            onMouseDown={this.onClick.bind(this, upOptions)}
          >
            <Icon type="arrow-up" />
          </div>
        )}

        {options.down && (
          <div
            className="move-arrow move-arrow-down"
            onMouseDown={this.onClick.bind(this, downOptions)}
          >
            <Icon type="arrow-down" />
          </div>
        )}
      </div>
    );
  }
}
