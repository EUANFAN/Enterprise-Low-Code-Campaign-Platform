import React from 'react';
import { HEModal, HEModalContent, HEModalHeader } from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import './index.less';
import { noop } from 'utils/FunctionUtils';

class HEComponentInfoPreview extends React.Component {
  static defaultProps = {
    onClose: noop,
    previewTargetUrl: 'http://www.baidu.com',
  };
  render() {
    const { onClose, previewTargetUrl } = this.props;

    return (
      <HESkyLayer
        onOverlayClick={onClose}
        className={'componentInfo-preview-skylayer'}
      >
        <HEModal className="componentInfo-preview-modal">
          <HEModalHeader title={'组件预览'} onClose={onClose} />
          <HEModalContent className="componentInfo-preview-modal__content">
            <iframe
              className="componentInfo-preview-modal__content__iframe"
              src={previewTargetUrl}
            />
          </HEModalContent>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default HEComponentInfoPreview;
