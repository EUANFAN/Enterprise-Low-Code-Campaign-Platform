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

export default class ConfirmPublishModal extends React.Component {
  render() {
    const { publishOnlineTest, publishOnline, onClose } = this.props;
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="publish-input-modal">
          <HEModalHeader title="提示" onClose={onClose} />
          <HEModalContent className="publish-input-modal__content">
            <p className="publish-input-modal__info">
              <span>测试发布：</span>生成线上的测试链接，用于线上测试
            </p>
            <p className="publish-input-modal__info">
              <span>正式发布：</span>生成线上的正式链接，用于正式投放
            </p>
          </HEModalContent>
          <HEModalActions>
            <HEButton
              className="publish-input-modal__cancle"
              secondary={true}
              onClick={onClose}
            >
              {'取消'}
            </HEButton>
            <HEButton
              className="publish-input-modal__publish"
              onClick={publishOnlineTest}
            >
              {'测试发布'}
            </HEButton>
            <HEButton
              className="publish-input-modal__publish"
              onClick={publishOnline}
            >
              {'正式发布'}
            </HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}
