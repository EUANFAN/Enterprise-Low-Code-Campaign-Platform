import React from 'react';
import classNames from 'classnames';
import './index.less';

const DEFAULT_TYPE = 'text';

export default class HEInput extends React.Component {
  static defaultProps = {
    className: '',
    type: DEFAULT_TYPE,
    maximumLetters: Infinity,
    value: '',
  };

  render() {
    const {
      className: classNameFromProp,
      type,
      placeholder,
      value,
      maximumLetters,
      onChange = () => {},
    } = this.props;
    const className = classNames(['he-input__input', classNameFromProp]);

    return (
      <span className="he-input">
        <input
          className={className}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maximumLetters}
        />
        {maximumLetters !== Infinity && (
          <div className="he-input__letter-count">
            {value.length}/{maximumLetters}
          </div>
        )}
      </span>
    );
  }
}
