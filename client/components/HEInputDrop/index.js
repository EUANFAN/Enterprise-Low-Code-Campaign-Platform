import React from 'react';
import classNames from 'classnames';
import './index.less';

const DEFAULT_TYPE = 'text';

export default class HEInputDrop extends React.Component {
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
      onChange,
      autoFillList,
      onSelected,
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
        {autoFillList.length > 0 && (
          <ul className="he-input__drop">
            {autoFillList.length > 0 &&
              autoFillList.map((item) => {
                return (
                  <li
                    className="he-input__drop__item"
                    key={item}
                    onClick={(event) => onSelected(event, item)}
                  >
                    {item}
                  </li>
                );
              })}
          </ul>
        )}
      </span>
    );
  }
}
