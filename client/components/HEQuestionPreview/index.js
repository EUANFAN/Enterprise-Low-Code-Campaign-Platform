import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import { HEModal, HEModalContent, HEModalHeader } from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import './index.less';

class QuestionPreviewModal extends React.Component {
  renderNextPreview = async () => {
    const { nextPreview } = this.props;
    nextPreview();
  };

  renderQuestionData = (data) => {
    const iframe = document.querySelector(
      '.question-preview-modal__content__iframe'
    );
    const { contentWindow } = iframe;
    if (!contentWindow.setCompoentConfig) {
      contentWindow.onload = () => {
        const { contentDocument } = iframe;
        contentWindow.setCompoentConfig(data);
        const submitButton = contentDocument.querySelectorAll(
          'button[type="submit"]'
        )[0];
        if (submitButton) {
          contentDocument.querySelectorAll(
            'button[type="submit"]'
          )[0].style.display = 'none';
        }
        this.renderLayer();
      };
    } else {
      contentWindow.setCompoentConfig(data);
    }
  };

  renderLayer = () => {
    const iframe = document.querySelector(
      '.question-preview-modal__content__iframe'
    );
    const { contentDocument } = iframe;
    const collectionForm = contentDocument.querySelector(
      '.widget_CollectionForm'
    );
    const div = contentDocument.createElement('div');
    div.style =
      'position:absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 999';
    div.classList.add('iframe-layer');
    collectionForm.appendChild(div);
  };

  render() {
    const { url, onClose } = this.props;
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="question-preview-modal">
          <HEModalHeader title={'预览'} onClose={onClose} />
          <HEModalContent className="question-preview-modal__content">
            <iframe
              className="question-preview-modal__content__iframe"
              src={url}
            />
            <RightOutlined
              className="question-preview-modal__next"
              onClick={this.renderNextPreview}
            />
          </HEModalContent>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default QuestionPreviewModal;
