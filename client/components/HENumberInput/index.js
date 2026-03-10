import React from 'react';
import classNames from 'classnames';

import './index.less';

export default class HENumberInput extends React.Component {
  static defaultProps = {
    className: '',
    value: 0,
    max: Infinity,
    min: 0,
  };

  render() {
    const {
      className: classNameFromProp,
      max,
      min,
      value,
      onChange,
    } = this.props;
    const className = classNames(['he-number-input', classNameFromProp]);

    return (
      <input
        max={max}
        min={min}
        className={className}
        value={value}
        onChange={onChange}
        type="number"
      />
    );
  }
}
