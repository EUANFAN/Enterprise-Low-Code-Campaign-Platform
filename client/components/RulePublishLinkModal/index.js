import React from 'react';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import HEInput from 'components/HEInput';
import ClipboardUtils from 'utils/ClipboardUtils';
import HESkyLayer from 'components/HESkyLayer';
import { toastError, toastSuccess } from 'components/HEToast';

import './index.less';

export default class RulePublishLinkModal extends React.Component {
  _handleTextCopy = async (url) => {
    try {
      await ClipboardUtils.copyTextToClipboard(url);
      toastSuccess('已复制到剪贴板');
    } catch (err) {
      toastError(err.message);
    }
  };
  _handleOpenNewTab = () => {
    const { url } = this.props;
    god.open(url);
  };
  render() {
    const { onClose, url } = this.props;
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="publish-input-modal">
          <HEModalHeader title="发布成功" onClose={onClose} />
          <HEModalContent className="publish-input-modal__content">
            <label className="label">链接：</label>
            <HEInput
              className="publish-page__content__header__inputs__row__input"
              value={url}
            />
            <HEButton
              className="publish-page__content__header__inputs__row__button"
              sizeType={HEButtonSizes.SMALL}
              onClick={() => this._handleTextCopy(url)}
            >
              {'复制'}
            </HEButton>
            <HEButton
              className="publish-page__content__header__inputs__row__button"
              sizeType={HEButtonSizes.SMALL}
              onClick={() => this._handleOpenNewTab()}
            >
              {'新页面打开'}
            </HEButton>
          </HEModalContent>
          <HEModalActions>
            <HEButton
              className="publish-input-modal__cancle"
              secondary={true}
              onClick={onClose}
            >
              {'关闭'}
            </HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}
