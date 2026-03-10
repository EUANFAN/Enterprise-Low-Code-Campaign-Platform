/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-03-25 11:38:42
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-05 15:14:02
 */
import React from 'react';
import classNames from 'classnames';
import HELoadingString from 'components/HELoadingString';

import { noop } from 'utils/FunctionUtils';

import './HEDrawerSectionItem.less';

export default class HEDrawerSectionItem extends React.Component {
  static defaultProps = {
    className: '',
    selected: false,
    onSelect: noop,
    itemKey: '',
  };

  _handleClick = () => {
    const { onSelect, itemKey, selected } = this.props;
    if (selected) {
      return;
    }
    onSelect(itemKey);
  };
  render() {
    const { className: classNameFromProp, selected, loading } = this.props;
    const className = classNames(
      ['he-drawer-section-item', classNameFromProp],
      {
        'he-drawer-section-item--selected': selected,
        'he-drawer-section-item--loading': loading,
      }
    );
    if (loading) {
      return (
        <div onClick={this._handleClick} className={className}>
          <HELoadingString length={84} />
        </div>
      );
    }
    return (
      <div onClick={this._handleClick} className={className}>
        <span className="he-drawer-section-item__text">
          {this.props.children}
        </span>
      </div>
    );
  }
}
