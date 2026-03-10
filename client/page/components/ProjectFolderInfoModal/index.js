import React from 'react';
import Moment from 'moment';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions
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
  const { children, ...elseProps } = props;
  return (
    <span {...elseProps} className="theme-info-modal__content__row__text">
      {children}
    </span>
  );
}

export default class ProjectFolderInfoModal extends React.Component {
  static defaultProps = {
    onClose: noop,
    onSubmit: noop
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

    this.props.onSubmit(event, { name: currentName });
  };

  render() {
    const { onClose, lastModified, createdAt, owner, _id, fileCount } =
      this.props;
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
          <HEModalHeader title={'文件夹信息'} onClose={onClose} />
          <HEModalContent className="theme-info-modal__content">
            <Row>
              <Label>{'名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="theme-info-modal__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={'文件夹标题'}
              />
            </Row>
            <Row>
              <Label>{'项目ID'}：</Label>
              <Text
                style={{
                  userSelect: 'text'
                }}
              >
                {_id}
              </Text>
            </Row>
            <Row>
              <Label>{'文件个数'}：</Label>
              <Text>{fileCount}</Text>
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
              <Label>{'拥有者'}：</Label>
              <Text>{owner}</Text>
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
