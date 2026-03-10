import React from 'react';
import classNames from 'classnames';

import { noop } from 'utils/FunctionUtils';

import { default as IconUpload } from 'components/icons/Upload';
// import HEIconButton from 'components/HEIconButton';

import './index.less';

export default class HEImgUpload extends React.Component {
  static defaultProps = {
    className: '',
    onChange: noop,
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
      src = '',
      onChange,
      accept,
      ...others
    } = this.props;
    const className = classNames(['he-imgUpload', classNameFromProp]);

    return (
      <div className={className} {...others}>
        <div
          className="he-imgUpload__mask"
          onClick={this._handleClick.bind(this)}
        >
          <span className="he-imgUpload__mask--icon">
            <IconUpload />
          </span>
        </div>
        <input
          ref={this._inputRef}
          style={{ display: 'none' }}
          type="file"
          accept={accept}
          multiple={false}
          onChange={onChange}
        />
        {src ? (
          <img
            className="widget-img"
            src={src}
            onClick={this._handleClick.bind(this)}
          />
        ) : null}
      </div>
    );
  }
}
