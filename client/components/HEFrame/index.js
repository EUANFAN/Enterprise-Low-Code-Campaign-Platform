import React from 'react';
import classNames from 'classnames';
import './index.less';

export default class HEFrame extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children } = this.props;
    const className = classNames(['he-frame', classNameFromProp]);

    return <div className={className}>{children}</div>;
  }
}
