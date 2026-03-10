import React from 'react';
import { Pagination } from 'antd';
import { noop } from 'utils/FunctionUtils';
import './index.less';

export default class HEPagination extends React.Component {
  static defaultProps = {
    className: '',
    onPageChange: noop,
    style: {},
  };

  onChange = (pageNumber) => {
    this.props.onPageChange(null, parseInt(pageNumber, 10));
  };

  render() {
    const { className: classNameFromProp, total, current } = this.props;

    return (
      <Pagination
        className={classNameFromProp}
        showQuickJumper
        pageSize={10}
        current={current}
        total={total * 10}
        onChange={this.onChange}
      />
    );
  }
}
