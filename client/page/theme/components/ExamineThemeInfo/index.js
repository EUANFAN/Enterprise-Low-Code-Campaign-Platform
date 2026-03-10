/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-16 14:22:50
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:02:35
 */
import React from 'react';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import { Input } from 'antd';
import HESkyLayer from 'components/HESkyLayer';
import { noop } from 'utils/FunctionUtils';
import { toastError } from 'components/HEToast';
import { Row } from 'components/HERow';
import './index.less';

export default class ExamineThemeInfoModal extends React.Component {
  static defaultProps = {
    onClose: noop,
    onSubmit: noop,
  };

  constructor(props) {
    super(props);

    this.state = { currentName: '' };
  }

  _handleNameChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ currentName: newTarget });
  };

  _handleSubmit = (event) => {
    const { currentName } = this.state;
    if (currentName.length) {
      this.props.onSubmit(event, currentName);
    } else {
      toastError('申请说明不能为空');
    }
  };

  render() {
    const { onClose, statusInfo, auditButtonContent } = this.props;
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="theme-info-modal">
          <HEModalHeader title={'审核信息'} onClose={onClose} />
          <HEModalContent className="theme-info-modal__content">
            <Row>
              <Input.TextArea
                placeholder={'请填写申请说明'}
                onChange={this._handleNameChange}
                className="create-theme-modal__content__row__input"
                autoSize
                maxLength={160}
              ></Input.TextArea>
            </Row>
            <Row>
              <p className="examine-input-modal__info">
                <span>状态：</span>
                {statusInfo}
              </p>
            </Row>
            <Row>
              <p className="examine-input-modal__info">
                <span>
                  *未公开的模板仅自己可见
                  <br />
                  超管审核通过后可对所有用户公开
                </span>
              </p>
            </Row>
          </HEModalContent>

          <HEModalActions>
            <HEButton
              className="examine-input-modal__cancle"
              secondary={true}
              onClick={onClose}
            >
              {'取消'}
            </HEButton>
            <HEButton
              className="examine-input-modal__publish"
              onClick={this._handleSubmit}
            >
              {auditButtonContent}
            </HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}
