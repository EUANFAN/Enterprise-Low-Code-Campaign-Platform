import React from 'react';
import classNames from 'classnames';
import './HEModal.less';

export default class HEModal extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children } = this.props;
    const className = classNames(['he-modal', classNameFromProp]);

    return <div className={className}>{children}</div>;
  }
}
