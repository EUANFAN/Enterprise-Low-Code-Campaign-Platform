import React from 'react';
import classNames from 'classnames';
import './HECardContent.less';

export default class HECardContent extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children, ...others } = this.props;
    const className = classNames(['he-card-content', classNameFromProp]);

    return (
      <div {...others} className={className}>
        {children}
      </div>
    );
  }
}
