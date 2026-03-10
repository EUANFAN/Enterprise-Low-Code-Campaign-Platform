import React from 'react';
import HEButton from 'components/HEButton';
import './HEModalFooter.less';
import HEUpload from 'components/HEUpload';
import { noop } from 'utils/FunctionUtils';

export default class HEModalFooter extends React.Component {
  static defaultProps = {
    onConfirm: noop,
    onClose: noop,
  };

  render() {
    const {
      isFilesNull,
      // onClose,
      onConfirm,
      onUpload,
      value,
      accept,
    } = this.props;
    return (
      <div className="he-modal-footer">
        {isFilesNull ? null : (
          <HEUpload
            className="he-modal-footer__confirm"
            value={value}
            onChange={onUpload}
            accept={accept}
            multiple={true}
          >
            {'继续添加'}
          </HEUpload>
        )}

        <HEButton className="he-modal-footer__cancel" onClick={onConfirm}>
          {'完成'}
        </HEButton>
      </div>
    );
  }
}
