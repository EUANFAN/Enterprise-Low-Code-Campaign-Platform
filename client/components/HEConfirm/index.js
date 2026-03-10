import React from 'react';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HESkyLayer from 'components/HESkyLayer';
import './index.less';

class Confirm extends React.Component {
  render() {
    const { onCancel, onConfirm, title, children, message } = this.props;
    // children在批量升级弹窗有用，勿删
    return (
      <HESkyLayer onOverlayClick={onCancel}>
        <HEModal className="confirm-modal">
          <HEModalHeader title={title} onClose={onCancel} />
          <HEModalContent className="confirm-modal__content">
            {message ? message : children}
          </HEModalContent>
          <HEModalActions className="confirm-modal__actions">
            <HEButton className="confirm-modal__cancel" onClick={onCancel}>
              {'取消'}
            </HEButton>
            <HEButton onClick={onConfirm}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default Confirm;
