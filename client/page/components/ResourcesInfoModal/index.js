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
import './index.less';

function Row(props) {
  return <div className="theme-info-modal__content__row">{props.children}</div>;
}

function Label(props) {
  return (
    <label className="theme-info-modal__content__row__label">
      {props.children}
    </label>
  );
}

function Text(props) {
  return (
    <span className="theme-info-modal__content__row__text">
      {props.children}
    </span>
  );
}

export default class ResourcesInfoModal extends React.Component {
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

    this.props.onSubmit(event, currentName);
  };

  render() {
    const { onClose, lastModified, creator, targetModalInfo } = this.props;
    const { currentName } = this.state;
    const lastModifiedString = lastModified
      ? Moment(lastModified).format('YYYY-MM-DD')
      : '-';
    let typeInfoName, typeInfoValue;

    switch (targetModalInfo.type) {
      case 'image':
        typeInfoName = '尺寸';
        typeInfoValue = targetModalInfo.size ? `${targetModalInfo.size.width} * ${targetModalInfo.size.height}` : '暂无';
        break;
      case 'video':
        // TODO：按照需求 typeInfoName 应该 = 视频时长，但是音视频时长获取暂时比较麻烦
        // 暂时使用 创建者 替代展示，待优化
        // typeInfoName = '创建者';
        // // typeInfoValue = TimeUtils.durationToTime(duration);
        // typeInfoValue = creator;
        break;
      case 'audio':
      default:
        // TODO：按照需求 typeInfoName 应该 = 音频时长，但是音频时长获取暂时比较麻烦
        // 暂时使用 创建者 替代展示，待优化
        // typeInfoName = '创建者';
        // // typeInfoValue = TimeUtils.durationToTime(duration);
        // typeInfoValue = creator;
        break;
    }

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="theme-info-modal">
          <HEModalHeader title={'文件信息'} onClose={onClose} />
          <HEModalContent className="theme-info-modal__content">
            <Row>
              <Label>{'名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="theme-info-modal__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={'请输入文件的名称'}
              />
            </Row>
            {typeInfoName ? (
              <Row>
                <Label>{typeInfoName}：</Label>
                <Text>{typeInfoValue}</Text>
              </Row>
            ) : null}
            <Row>
              <Label>{'创建时间'}：</Label>
              <Text>{lastModifiedString}</Text>
            </Row>
            <Row>
              <Label>{'创建者'}：</Label>
              <Text>{creator}</Text>
            </Row>
            <Row>
              <Label>{'URL'}：</Label>
              <HEInput
                value={targetModalInfo.url}
                onChange={this._handleNameChange}
                className="theme-info-modal__content__row__input"
                type="text"
                disable
                placeholder={'请输入文件的名称'}
              />
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
