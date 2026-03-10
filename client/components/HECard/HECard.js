import React from 'react';
import classNames from 'classnames';

import './HECard.less';

export default class HECard extends React.Component {
  static defaultProps = {
    className: '',
    disableFloat: true,
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      disableFloat,
      ...others
    } = this.props;
    const className = classNames(['he-card', classNameFromProp], {
      'he-card--disable-float': disableFloat,
    });

    return (
      <div {...others} className={className}>
        {children}
      </div>
    );
  }
}
