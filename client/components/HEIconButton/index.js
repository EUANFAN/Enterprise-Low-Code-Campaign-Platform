import React from 'react';
import classNames from 'classnames';
import './index.less';

class HEIconButton extends React.Component {
  render() {
    const {
      forwardRef,
      className: classNameFromProp,
      iconElement,
      titleElement,
      disabled,
      active,
      onClick,
      ...others
    } = this.props;
    const className = classNames(['he-icon-button', classNameFromProp], {
      'he-icon-button--active': active,
      'he-icon-button--disabled': disabled,
    });
    return (
      <div
        {...others}
        ref={forwardRef}
        disabled={Boolean(disabled)}
        onClick={!disabled ? onClick : undefined}
        className={className}
      >
        <span className="he-icon-button__icon">{iconElement}</span>
        <span className="he-icon-button__text">{titleElement}</span>
      </div>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <HEIconButton {...props} forwardRef={ref} />
));
