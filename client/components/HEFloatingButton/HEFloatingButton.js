import React from 'react';
import classNames from 'classnames';
import './HEFloatingButton.less';

// NOTE: Though this is called FloatingButton, it does not really floating.
export default class HEFloatingButton extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      selected,
      disabled,
      ...others
    } = this.props;
    const className = classNames(['he-floating-button', classNameFromProp], {
      'he-floating-button--selected': selected,
      'he-floating-button--disabled': disabled,
    });

    return (
      <button {...others} disabled={disabled} className={className}>
        {children}
      </button>
    );
  }
}
