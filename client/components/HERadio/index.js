import React from 'react';
import classNames from 'classnames';
import './index.less';

export default class HERadioGroup extends React.Component {
  static defaultProps = {
    className: '',
    value: '',
  };

  render() {
    const {
      className: classNameFromProp,
      options,
      value,
      onChange,
    } = this.props;
    const className = classNames(['he-radio-group', classNameFromProp]);
    return (
      <div className={className}>
        {options.map((option) => {
          const radioClass = classNames(['he-radio-group__radio'], {
            'he-radio-group__radio--selected': option.value === value,
          });

          return (
            <div
              key={option.value}
              className={radioClass}
              onClick={(event) => onChange(event, option.value)}
            >
              <div className="he-radio-group__radio__checkbox" />
              <span className="he-radio-group__radio__label">{option.key}</span>
            </div>
          );
        })}
      </div>
    );
  }
}
