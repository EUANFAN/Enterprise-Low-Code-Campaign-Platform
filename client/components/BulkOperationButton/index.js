import React from 'react';
import classNames from 'classnames';

import HEButton from 'components/HEButton';

import './index.less';

export default class BulkOperationButton extends React.Component {
  render() {
    const {
      className: classNameFromProp,
      children,
      sizeType,
      outline,
      onToggle,
      active,
    } = this.props;
    const className = classNames(['bulk-operation-button', classNameFromProp], {
      'bulk-operation-button--active': active,
    });
    // TODO：暂时关闭批量操作入口
    return <></>;
    if (!active) {
      return (
        <HEButton
          className={className}
          onClick={onToggle}
          sizeType={sizeType}
          outline={outline}
        >
          {'批量操作'}
        </HEButton>
      );
    }

    return (
      <div className={className}>
        <HEButton
          className="bulk-operation-button__cancel-button"
          onClick={onToggle}
          sizeType={sizeType}
          outline={outline}
        >
          {'退出批量操作'}
        </HEButton>
        <div className="bulk-operation-button__icon-buttons">{children}</div>
      </div>
    );
  }
}
