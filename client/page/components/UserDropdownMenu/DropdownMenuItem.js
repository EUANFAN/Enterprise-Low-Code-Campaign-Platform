import React from 'react';
import HEIconButton from 'components/HEIconButton';
import HELink from 'components/HELink';
import HEDropdown from 'components/HEDropdown';

export default class DropdownMenuItem extends React.Component {
  _element = React.createRef();

  render() {
    const { active, iconElement, title, onClick, onClose, children, menuTop } =
      this.props;
    return (
      <HEDropdown
        show={active}
        targetElement={this._element.current}
        onClose={onClose}
        menu={children}
        menuTop={menuTop}
      >
        <HEIconButton
          ref={this._element}
          active={active}
          onClick={onClick}
          iconElement={iconElement}
          titleElement={
            <HELink expand={active} floatingArrow={true}>
              {title}
            </HELink>
          }
        />
      </HEDropdown>
    );
  }
}
