import React from 'react';
import Moment from 'moment';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import HESkyLayer from 'components/HESkyLayer';
import { noop } from 'utils/FunctionUtils';
import { toastError } from 'components/HEToast';
import { Label, Row, Text } from 'components/HERow';
import './index.less';

export default class ThemeInfoModal extends React.Component {
  static defaultProps = {
    onClose: noop,
    onSubmit: noop,
  };

  constructor(props) {
    super(props);

    this.state = { currentName: props.name };
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
      toastError('模板名称不能为空');
    }
  };

  render() {
    const { onClose, lastModified, createdAt, creator } = this.props;
    const { currentName } = this.state;
    const lastModifiedString = lastModified
      ? Moment(lastModified).format('YYYY-MM-DD HH:mm:ss')
      : '--';
    const createdAtString = createdAt
      ? Moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
      : '--';

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="theme-info-modal">
          <HEModalHeader title={'模板信息'} onClose={onClose} />
          <HEModalContent className="theme-info-modal__content">
            <Row>
              <Label>{'组名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="theme-info-modal__content__row__input"
                type="text"
                maximumLetters={10}
                placeholder={'请输入模板的名称'}
              />
            </Row>
            <Row>
              <Label>{'最新修改时间'}：</Label>
              <Text>{lastModifiedString}</Text>
            </Row>
            <Row>
              <Label>{'创建时间'}：</Label>
              <Text>{createdAtString}</Text>
            </Row>
            <Row>
              <Label>{'创建者'}：</Label>
              <Text>{creator}</Text>
            </Row>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}
