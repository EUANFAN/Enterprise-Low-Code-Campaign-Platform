import React from 'react';
import classNames from 'classnames';
import './index.less';
import { Table } from 'antd';

export default class HEIcon extends React.Component {
  render() {
    const { className: classNameFromProp } = this.props;
    const className = classNames(['he-table', classNameFromProp]);
    const infoList = Object.assign({}, this.props, { className });
    return <Table {...infoList} pagination={false} size={'default'} />;
  }
}
