import React from 'react';
import classNames from 'classnames';
import Arrow from 'components/icons/Arrow';

import './index.less';
function Menu(props) {
  return (
    <ul onClick={props.onClick} className="he-select__overlay__items">
      {props.children}
    </ul>
  );
}

function MenuItem(props) {
  return <li className="he-select__overlay__items__item">{props.children}</li>;
}

function isTargetInParent(target, component) {
  let node = target;

  do {
    if (node === component) {
      return true;
    }
    node = node.parentElement;
  } while (node != null);

  return false;
}

export default class HESelect extends React.Component {
  static defaultProps = {
    className: '',
    menuMaxHeight: '300px',
  };

  state = {
    open: false,
  };
  _overlayRef = React.createRef();
  _selectTriggerRef = React.createRef();
  componentDidMount() {
    god.addEventListener('click', this._handleWindowClick, true);
  }

  componentWillUnmount() {
    god.removeEventListener('click', this._handleWindowClick, true);
  }
  // Check for click away
  _handleWindowClick = (event) => {
    const { current } = this._overlayRef;
    const { target } = event;

    const { current: triggerCurrent } = this._selectTriggerRef;
    const isTrigger = triggerCurrent == target;

    if (
      isTrigger ||
      !this.state.open ||
      !current ||
      !target ||
      isTargetInParent(target, current)
    ) {
      return;
    }

    this.setState({ open: false });
  };

  _handleToggle = () => {
    this.setState((currentState) => ({
      open: !currentState.open,
    }));
  };

  _handleItemSelect = (event) => {
    const { target } = event;
    const { onSelect, options } = this.props;
    const parentElement = target.parentElement;

    if (!parentElement) {
      return;
    }

    const childrenArray = Array.from(parentElement.children);
    const targetIndex = childrenArray.indexOf(target);
    const targetOption = options[targetIndex];

    onSelect(event, targetOption.value);
  };

  render() {
    const {
      className: classNameFromProp,
      options,
      value,
      placeholder,
      menuMaxHeight,
    } = this.props;
    const { open } = this.state;
    const selectedOption = options.find((option) => option.value === value);

    const className = classNames(['he-select', classNameFromProp], {
      'he-select--active': open,
    });
    const triggerClass = classNames(['he-select__trigger'], {
      'he-select__trigger--empty': !selectedOption,
    });

    const menuStyle = {
      maxHeight: menuMaxHeight,
    };
    return (
      <div className={className}>
        <div
          className={triggerClass}
          ref={this._selectTriggerRef}
          onClick={this._handleToggle}
        >
          {selectedOption ? selectedOption.key : placeholder}
        </div>
        {open && (
          <div
            className="he-select__overlay"
            onClick={this._handleToggle}
            ref={this._overlayRef}
            style={menuStyle}
          >
            {placeholder && (
              <div className="he-select__overlay__header">{placeholder}</div>
            )}
            <Menu onClick={this._handleItemSelect}>
              {options.map(({ key, value }) => (
                <MenuItem key={value}>{key}</MenuItem>
              ))}
            </Menu>
          </div>
        )}
        <Arrow className="he-select__arrow" />
      </div>
    );
  }
}
