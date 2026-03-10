import React from 'react';
import classNames from 'classnames';
import HEIcon from 'components/HEIcon';
import HEButton from 'components/HEButton';
import HEDropdown from 'components/HEDropdown';
import './index.less';
export default class HEDropDwonMenu extends React.Component {
  constructor(props) {
    super(props);
    this._element = React.createRef();
  }

  render() {
    const {
      active,
      title,
      onClick,
      onClose,
      menuTop,
      children,
      secondary,
      icon,
      rightArrow,
      className: classNameFromProp,
    } = this.props;
    const className = classNames(['he-drop-btn', classNameFromProp]);
    return (
      <HEDropdown
        show={active}
        targetElement={this._element.current}
        onClose={onClose}
        menu={children}
        menuTop={menuTop}
      >
        <HEButton
          ref={this._element}
          className={className}
          onClick={onClick}
          icon={icon}
          secondary={secondary}
        >
          {title}
          {rightArrow ? (
            <HEIcon className="icon-arrow" type="icon-down2" />
          ) : null}
        </HEButton>
      </HEDropdown>
    );
  }
}
