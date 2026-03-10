import React from 'react';
import classNames from 'classnames';

import { noop } from 'utils/FunctionUtils';
import './HENavbarPageList.less';

export default class HENavbarPageList extends React.Component {
  static defaultProps = {
    className: '',
    onPageChange: noop,
  };

  _handlePageClick = (event) => {
    const { target } = event;
    const { onPageChange, pages } = this.props;
    const parentElement = target.parentElement;

    if (!parentElement) {
      return;
    }

    const childrenArray = Array.from(parentElement.children);
    const targetIndex = childrenArray.indexOf(target);

    onPageChange(event, pages[targetIndex].key);
  };

  render() {
    const { className: classNameFromProp, pages, selectedPage } = this.props;
    const className = classNames(['he-navbar-page-list', classNameFromProp]);
    return (
      <ul className={className}>
        {pages.map((page) => {
          const className = classNames(['he-navbar-page-list__item'], {
            'he-navbar-page-list__item--active': page.key === selectedPage,
          });

          return (
            <li
              key={page.key}
              className={className}
              onClick={this._handlePageClick}
            >
              {page.name}
            </li>
          );
        })}
      </ul>
    );
  }
}
