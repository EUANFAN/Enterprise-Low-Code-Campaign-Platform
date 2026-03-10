/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-14 17:16:14
 * @LastEditors: jielang
 * @LastEditTime: 2020-12-17 22:33:03
 */
import React from 'react';
import classNames from 'classnames';
import './index.less';

const DEFAULT_ITEM_LIST = new Array(1).fill(null);

export default class HEFileCollection extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children } = this.props;
    const className = classNames([
      classNameFromProp,
      'he-file-collection__list',
    ]);
    const childrenList = Object.assign(
      [],
      DEFAULT_ITEM_LIST,
      children.slice(0, 1)
    );
    return (
      <div className={className}>
        {childrenList.map((child, index) => {
          const _className = classNames(['he-file-collection__list__item']);
          return (
            <div className={_className} key={index}>
              {child}
              <div className="he-file-collection__list__item__overlay"></div>
            </div>
          );
        })}
      </div>
    );
  }
}
