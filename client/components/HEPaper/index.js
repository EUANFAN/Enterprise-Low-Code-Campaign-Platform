import React from 'react';
import classNames from 'classnames';
import './index.less';

export default class HEPaper extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children, horizontal } = this.props;
    const className = classNames(['he-paper', classNameFromProp], {
      'he-paper--horizontal': !!horizontal,
    });

    return <div className={className}>{children}</div>;
  }
}
