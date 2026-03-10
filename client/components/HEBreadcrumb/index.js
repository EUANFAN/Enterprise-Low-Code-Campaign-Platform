import React from 'react';
import classNames from 'classnames';
import HELoadingString from 'components/HELoadingString';
import { noop } from 'utils/FunctionUtils';
import './index.less';

const DEFAULT_SEPARATOR_SIGN = '>';

export default class HEBreadcrumb extends React.Component {
  static defaultProps = {
    className: '',
    sign: DEFAULT_SEPARATOR_SIGN,
    list: [],
    onClick: noop,
  };

  _handleClick = (event, index, item) => {
    this.props.onClick(event, index, item);
  };

  render() {
    const {
      className: classNameFromProp,
      list: propList,
      sign,
      loading,
    } = this.props;
    const className = classNames(['he-breadcrumb', classNameFromProp]);
    const list = loading ? new Array(2).fill(null) : propList;
    return (
      <div className={className}>
        {list.map((item, index) => {
          const isLastItem = index === list.length - 1;
          const breadcrumbItem = item ? (
            <a
              className="he-breadcrumb__item he-breadcrumb__item--current"
              onClick={(e) => {
                this._handleClick(e, index, item);
              }}
            >
              {item.name}
            </a>
          ) : (
            <HELoadingString />
          );

          return (
            <React.Fragment key={index}>
              {breadcrumbItem}
              {!isLastItem && (
                <span className="he-breadcrumb__sign">{sign}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}
