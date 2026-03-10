import React from 'react';
import classNames from 'classnames';
import HEIcon from 'components/HEIcon';
import './index.less';

export const HEButtonSizes = {
  SMALL: 0,
  NORMAL: 1,
  LARGE: 2,
};

// 是 蓝色 还是 灰色
// 是 outline 还是 bgcolor
// type 是固定size  还是 padding
class HEButton extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const {
      forwardRef,
      className: classNameFromProp,
      children,
      secondary,
      outline,
      outlineColor,
      disabled,
      sizeType,
      style: propStyle,
      icon,
      ...others
    } = this.props;
    const className = classNames(['he-button', classNameFromProp], {
      'he-button--secondary': secondary,
      'he-button--disabled': disabled,
      'he-button--outline': outline,
      'he-button--small': sizeType === HEButtonSizes.SMALL,
      'he-button--large': sizeType === HEButtonSizes.LARGE,
    });
    const iconClassName = classNames(['he-button-icon', icon]);
    const style = (outlineColor && { borderColor: outlineColor }) || {};
    Object.assign(style, propStyle);
    return (
      <button {...others} className={className} style={style} ref={forwardRef}>
        {icon ? <HEIcon className={iconClassName} /> : null}
        {children}
      </button>
    );
  }
}

export default React.forwardRef((props, ref) => (
  <HEButton {...props} forwardRef={ref} />
));
