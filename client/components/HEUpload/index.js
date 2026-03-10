import React from 'react';
import classNames from 'classnames';
import HEButton from 'components/HEButton';
const inputStyle = { display: 'none' };

export default class HEUpload extends React.Component {
  static defaultProps = {
    className: '',
  };

  _inputRef = React.createRef();

  _handleClick = () => {
    const { current } = this._inputRef;
    if (!current) {
      return;
    }
    current.value = '';
    current.click();
  };

  render() {
    const {
      className: classNameFromProp,
      onChange,
      accept,
      multiple,
      ...others
    } = this.props;

    const className = classNames(['he-upload', classNameFromProp]);

    return (
      <React.Fragment>
        <HEButton
          {...others}
          className={className}
          onClick={this._handleClick}
        />
        <input
          ref={this._inputRef}
          style={inputStyle}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
        />
      </React.Fragment>
    );
  }
}
