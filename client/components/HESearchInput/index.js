import React from 'react';
import classNames from 'classnames';
import SearchIcon from 'components/icons/Search';
import { noop } from 'utils/FunctionUtils';
import './index.less';
export const HEButtonSizes = {
  SMALL: 0,
  NORMAL: 1,
  LARGE: 2,
};

const ENTER_KEY_CODE = 13;
const ACTIVE_COLOR = '#666';

export default class HESearchInput extends React.Component {
  static defaultProps = {
    className: '',
    onKeyDown: noop,
    onSearch: noop,
  };

  _input = React.createRef();

  state = {
    focus: false,
    hover: false,
  };

  _handleKeyDown = (event) => {
    const { onSearch, onKeyDown } = this.props;
    onKeyDown(event);

    if (event.keyCode === ENTER_KEY_CODE) {
      onSearch(event);
      const inputElement = this._input.current;

      if (inputElement) {
        inputElement.blur();
      }
    }
  };

  _handleFocus = () => {
    this.setState({ focus: true });
  };

  _handleBlur = () => {
    this.setState({ focus: false });
  };

  _handleMouseEnter = () => {
    this.setState({ hover: true });
  };

  _handleMouseLeave = () => {
    this.setState({ hover: false });
  };

  _handleIconClick = () => {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      keyCode: ENTER_KEY_CODE,
    });
    this._input.current.dispatchEvent(event);
  };

  render() {
    const {
      className: classNameFromProp,
      defaultValue,
      placeholder,
      onSearch, // eslint-disable-line no-unused-vars
      ...others
    } = this.props;
    const { focus, hover } = this.state;
    const className = classNames(['he-search-input', classNameFromProp]);

    return (
      <div className={className}>
        <input
          {...others}
          ref={this._input}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="he-search-input__input"
          type="search"
          onFocus={this._handleFocus}
          onBlur={this._handleBlur}
          onMouseEnter={this._handleMouseEnter}
          onMouseLeave={this._handleMouseLeave}
          onKeyDown={this._handleKeyDown}
        />
        <SearchIcon
          onClick={this._handleIconClick}
          className="he-search-input__action-button"
          fill={hover || focus ? ACTIVE_COLOR : ''}
        />
      </div>
    );
  }
}
