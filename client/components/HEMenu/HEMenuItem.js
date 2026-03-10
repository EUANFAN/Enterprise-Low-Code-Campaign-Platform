import React from 'react';
import classNames from 'classnames';
import './HEMenuItem.less';
const DEFAULT_PADDING = 20;

export default class HEMenuItem extends React.Component {
  static defaultProps = {
    className: '',
    padding: DEFAULT_PADDING,
  };

  render() {
    const { className: classNameFromProp, children, ...others } = this.props;
    const className = classNames(['he-menu-item', classNameFromProp]);

    return (
      <li {...others} className={className}>
        <span>{children}</span>
      </li>
    );
  }
}
