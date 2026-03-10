import React from 'react';
import classNames from 'classnames';

import Arrow from 'components/icons/Arrow';
import { noop } from 'utils/FunctionUtils';
import './index.less';

export default class HELink extends React.Component {
  static defaultProps = {
    className: '',
    onClick: noop,
    showArrow: true,
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      secondary,
      onClick,
      showArrow,
      expand,
      floatingArrow,
      ...others
    } = this.props;
    const className = classNames(['he-link', classNameFromProp], {
      'he-link--secondary': secondary,
      'he-link--expand': expand,
      'he-link--floating-arrow': floatingArrow,
    });

    return (
      <a {...others} className={className} onClick={onClick}>
        {children}
        {showArrow && (
          <div className="he-link__arrow-container">
            <Arrow className="he-link__arrow-container__arrow" />
          </div>
        )}
      </a>
    );
  }
}
