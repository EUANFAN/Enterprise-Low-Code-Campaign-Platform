import React from 'react';
import Moment from 'moment';
import { InputNumber } from 'antd';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import HESkyLayer from 'components/HESkyLayer';
import { toastError } from 'components/HEToast';
import { noop } from 'utils/FunctionUtils';
import { Label, Row, Text } from 'components/HERow';
import './index.less';
export default class ThemeGroupModal extends React.Component {
  static defaultProps = {
    onClose: noop,
    onSubmit: noop,
  };

  constructor(props) {
    super(props);

    this.state = { currentName: props.name, currentWeight: props.weight || 0 };
  }

  _handleNameChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ currentName: newTarget });
  };
  _handleWeightChange = (val) => {
    this.setState({ currentWeight: val });
  };
  _handleSubmit = (event) => {
    const { currentName, currentWeight } = this.state;
    if (!currentName.length) {
      return toastError('模板组名称不能为空');
    }
    this.props.onSubmit(event, currentName, currentWeight);
  };

  render() {
    const { onClose, themeCount, lastModified, createdAt, creator } =
      this.props;
    const { currentName, currentWeight } = this.state;
    const lastModifiedString = lastModified
      ? Moment(lastModified).format('YYYY-MM-DD HH:mm:ss')
      : '--';
    const createdAtString = createdAt
      ? Moment(createdAt).format('YYYY-MM-DD HH:mm:ss')
      : '--';

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="theme-info-modal">
          <HEModalHeader title={'模板组信息'} onClose={onClose} />
          <HEModalContent className="theme-info-modal__content">
            <Row>
              <Label>{'组名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="theme-info-modal__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={'请输入模板的名称'}
              />
            </Row>
            <Row>
              <Label>{'权重'}：</Label>
              <InputNumber
                className="theme-info-modal__content__row__input"
                min={0}
                max={100}
                value={currentWeight}
                onChange={this._handleWeightChange}
              />
            </Row>
            <Row>
              <Label>{'组内模板个数'}：</Label>
              <Text>{themeCount}</Text>
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
