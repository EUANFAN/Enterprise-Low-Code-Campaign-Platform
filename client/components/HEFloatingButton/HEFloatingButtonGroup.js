import React from 'react';
import classNames from 'classnames';

import './HEFloatingButtonGroup.less';

export default class HEFloatingButtonGroup extends React.Component {
  render() {
    const {
      className: classNameFromProp,
      children,
      vertical,
      ...others
    } = this.props;
    const className = classNames(
      ['he-floating-button-group', classNameFromProp],
      {
        'he-floating-button-group--vertical': vertical,
        'he-floating-button-group--horizontal': !vertical,
      }
    );

    return (
      <div {...others} className={className}>
        {children}
      </div>
    );
  }
}
