import React from 'react';
import classNames from 'classnames';
import './index.less';

export default class HEIcon extends React.Component {
  render() {
    const { type, className: classNameFromProp, style } = this.props;
    const className = classNames(['iconfont', type, classNameFromProp]);
    return <i className={className} style={style ? style : {}} />;
  }
}
