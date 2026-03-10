import React from 'react';
import classNames from 'classnames';

import Loading from 'components/icons/Loading';

import './index.less';

export default class HELoading extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp } = this.props;
    const className = classNames(['he-loading', classNameFromProp]);

    return (
      <div className={className}>
        <Loading />
        <span>{'正在加载中...'}</span>
      </div>
    );
  }
}
