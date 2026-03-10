import React from 'react';
import { ConfirmContext } from 'context/feedback';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HESkyLayer from 'components/HESkyLayer';

export default class ConfirmProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      confirm: null,
    };
  }
  _handleConfirm = () => {
    const { confirm } = this.state;
    confirm && confirm.onConfirm && confirm.onConfirm();
    this.setState({ confirm: null });
  };

  _handleCancel = () => {
    const { confirm } = this.state;
    confirm && confirm.onCancel && confirm.onCancel(new Error('用户取消'));
    this.setState({ confirm: null });
  };

  _handleConfirmSet = (message, title) => {
    const { confirm } = this.state;
    if (confirm) {
      return Promise.reject(new Error('同时间只能有一个确认弹窗'));
    }

    return new Promise((resolve, reject) => {
      this.setState({
        confirm: {
          title,
          message,
          onConfirm: resolve,
          onCancel: reject,
        },
      });
    });
  };

  render() {
    const { children } = this.props;
    const { confirm } = this.state;
    return (
      <ConfirmContext.Provider
        value={{
          onConfirmSet: this._handleConfirmSet,
        }}
      >
        <React.Fragment>
          {children}
          {confirm && (
            <HESkyLayer onOverlayClick={this._handleCancel}>
              <HEModal className="confirm-modal">
                <HEModalHeader
                  title={confirm.title}
                  onClose={this._handleCancel}
                />
                <HEModalContent className="confirm-modal__content">
                  {confirm.message}
                </HEModalContent>
                <HEModalActions>
                  <HEButton onClick={this._handleConfirm}>{'确定'}</HEButton>
                </HEModalActions>
              </HEModal>
            </HESkyLayer>
          )}
        </React.Fragment>
      </ConfirmContext.Provider>
    );
  }
}
