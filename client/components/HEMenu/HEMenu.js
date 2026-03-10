import React from 'react';
import classNames from 'classnames';

import { noop } from 'utils/FunctionUtils';
import './HEMenu.less';

export default class HEMenu extends React.Component {
  static defaultProps = {
    className: '',
    onClick: noop,
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      onClick,
      ...others
    } = this.props;
    const className = classNames(['he-menu', classNameFromProp]);

    return (
      <ul {...others} className={className} onClick={onClick}>
        {children}
      </ul>
    );
  }
}
