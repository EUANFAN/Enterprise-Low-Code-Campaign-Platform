import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import Arrow from 'components/icons/Arrow';
import HEInput from 'components/HEInput';

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
  constructor() {
    super();
    this.debounce = _.debounce((fn, data) => {
      fn(data);
    }, 500);
  }
  static defaultProps = {
    className: '',
    menuMaxHeight: '300px',
  };

  state = {
    open: false,
    selectEl: null,
    showLoading: false,
    searchValue: '',
    noMore: false,
  };
  _selectTriggerRef = React.createRef();
  componentDidMount() {
    god.addEventListener('click', this._handleWindowClick, true);
  }

  componentWillUnmount() {
    god.removeEventListener('click', this._handleWindowClick, true);
  }
  hideLoading() {
    this.setState({ showLoading: false });
  }
  showNoMore() {
    this.setState({ noMore: true });
  }
  _getSelectEl = (el) => {
    if (el === null) return;
    this.setState({
      selectEl: el,
    });
    el.addEventListener(
      'scroll',
      _.throttle(this._handleSelectScroll.bind(this), 500)
    );
  };
  _handleSelectScroll = (e) => {
    const selectWrap = e.target;
    const { noMore } = this.state;
    if (
      selectWrap.scrollHeight - selectWrap.offsetHeight - selectWrap.scrollTop <
        20 &&
      !noMore
    ) {
      this.setState(
        {
          showLoading: true,
        },
        function () {
          selectWrap.scrollTop = selectWrap.scrollHeight;
        }
      );
      this.props.onDropDown && this.props.onDropDown();
    }
  };
  _handleSearchChange = (e) => {
    const { onSearchChange } = this.props;
    const value = e.target.value;
    this.setState({ searchValue: value, noMore: false });
    onSearchChange && this.debounce(onSearchChange, value);
  };
  // Check for click away
  _handleWindowClick = (event) => {
    const selectEl = this.state.selectEl;
    const { target } = event;

    const { current: triggerCurrent } = this._selectTriggerRef;
    const isTrigger = triggerCurrent == target;

    if (
      isTrigger ||
      !this.state.open ||
      !selectEl ||
      !target ||
      isTargetInParent(target, selectEl)
    ) {
      return;
    }

    this.setState({ open: false });
  };

  _handleToggle = (e) => {
    if (e.target.tagName === 'INPUT') return;
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
      showSearch,
    } = this.props;
    const { open, showLoading, searchValue, noMore } = this.state;
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
          <div>
            <div
              className="he-select__overlay"
              onClick={this._handleToggle}
              ref={this._getSelectEl}
              style={menuStyle}
            >
              {showSearch && (
                <HEInput
                  value={searchValue}
                  onChange={this._handleSearchChange}
                  className="create-theme-modal__content__row__input he-select-search"
                  type="text"
                  placeholder={'输入关键字搜索'}
                />
              )}
              {placeholder && (
                <div className="he-select__overlay__header">{placeholder}</div>
              )}
              <Menu onClick={this._handleItemSelect}>
                {options.map(({ key }) => (
                  <MenuItem key={key}>{key}</MenuItem>
                ))}
              </Menu>
              {showLoading && (
                <div className="he-select__overlay__loading">加载中...</div>
              )}
              {noMore && (
                <div className="he-select__overlay__loading">
                  -- 没有更多了 --
                </div>
              )}
            </div>
          </div>
        )}
        <Arrow className="he-select__arrow" />
      </div>
    );
  }
}
