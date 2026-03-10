import React from 'react';
import classNames from 'classnames';
import Close from 'components/icons/Close';
import './HEModalHeader.less';
import { noop } from 'utils/FunctionUtils';

export default class HEModalHeader extends React.Component {
  static defaultProps = {
    className: '',
    onClose: noop,
  };

  render() {
    const { className: classNameFromProp, onClose, title } = this.props;
    const className = classNames(['he-modal-header', classNameFromProp]);

    return (
      <div className={className}>
        <h1 className="he-modal-header__title">{title}</h1>
        <Close onClick={onClose} className="he-modal-header__close" />
      </div>
    );
  }
}
