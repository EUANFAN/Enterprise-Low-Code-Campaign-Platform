import React from 'react';
import classNames from 'classnames';
import HEIcon from 'components/HEIcon';
import './HEHiddenButton.less';

class HEHiddenButton extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      icon,
      forwardedRef,
      ...others
    } = this.props;
    const className = classNames(['he-hidden-button', classNameFromProp]);

    return (
      <span {...others} ref={forwardedRef} className={className}>
        {icon ? <HEIcon type={icon} /> : null}
        {children}
      </span>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <HEHiddenButton {...props} forwardedRef={ref} />
));
