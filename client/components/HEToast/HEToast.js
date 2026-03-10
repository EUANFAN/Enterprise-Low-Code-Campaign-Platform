import React from 'react';
import classNames from 'classnames';
import Loading from 'components/icons/Loading';
import ErrorIcon from 'components/icons/Error';
import Success from 'components/icons/Success';
import Info from 'components/icons/Info';
import Warn from 'components/icons/Warn';
import Close from 'components/icons/Close';
import { closeToast } from './toastInstance';
import './HEToast.less';
export const ToastTypes = {
  Success: Success,
  Info: Info,
  Warn: Warn,
  Error: ErrorIcon,
  Loading: Loading,
};

export default class HEToast extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, message, type, desc } = this.props;
    const className = classNames(classNameFromProp, {
      'he-toast--active': open,
    });
    const ToastType = ToastTypes[type];
    return (
      <div className="he-toast">
        <div className={className}>
          <div className="he-toast-title-wrap">
            <ToastType />
            <span className="he-toast-title">{message}</span>
          </div>
          {type !== 'Loading' && <Close onClick={closeToast} />}
        </div>
        {desc && <div className="he-toast-desc">{desc}</div>}
      </div>
    );
  }
}
