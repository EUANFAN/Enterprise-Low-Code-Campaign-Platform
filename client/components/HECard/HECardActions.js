import React from 'react';
import classNames from 'classnames';
import './HECardActions.less';

export default class HECardActions extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children } = this.props;
    const className = classNames(['he-card-actions', classNameFromProp]);

    return <div className={className}>{children}</div>;
  }
}
