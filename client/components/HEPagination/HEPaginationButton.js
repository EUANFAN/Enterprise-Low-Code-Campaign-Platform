import React from 'react';
import classNames from 'classnames';
import './HEPaginationButton.less';

export default class HEPaginationButton extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const {
      className: classNameFromProp,
      children,
      selected,
      ...others
    } = this.props;
    const className = classNames(['he-pagination-button', classNameFromProp], {
      'he-pagination-button--selected': selected,
    });

    return (
      <button {...others} className={className}>
        {children}
      </button>
    );
  }
}
