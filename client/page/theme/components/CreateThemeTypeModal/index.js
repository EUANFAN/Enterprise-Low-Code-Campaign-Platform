import React from 'react';
import Moment from 'moment';
import HEInput from 'components/HEInput';
import ShowConfirm from 'components/HEConfirm';
import { noop } from 'utils/FunctionUtils';
import { Select } from 'antd';
import { Text } from 'components/HERow';
const { Option } = Select;

import './index.less';

function Row(props) {
  return (
    <div className="create-themeType-modal__content__row">{props.children}</div>
  );
}

function Label(props) {
  return (
    <label className="create-themeType-modal__content__row__label">
      {props.children}
    </label>
  );
}

class CreateThemeTypeModal extends React.Component {
  static defaultProps = {
    isCreateTheme: true,
    onConfirm: noop,
    onClose: noop,
    title: '新增模板类别',
    name: '',
    keyIds: '',
    reviewerIds: [],
    reviewerCount: 1,
  };

  state = {
    key: this.props.keyIds,
    name: this.props.name,
    reviewerIds: this.props.reviewerIds,
  };

  _handleNameChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ name: newTarget });
  };

  _handleKeyChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ key: newTarget });
  };
  _handlereviewerIdsChange = (value) => {
    const count = this.props.reviewerCount * -1;
    this.setState({ reviewerIds: value.slice(count) });
  };

  _handleSubmit = (event) => {
    const { currentName: name, createType: createType } = this.state;

    this.props.onSubmit(event, name, createType);
  };

  _handleLayoutTypeSelect = (event, selectValue) => {
    this.setState({ createType: selectValue });
  };

  render() {
    const {
      onCancel,
      onConfirm,
      title,
      isCreateTheme,
      lastModified,
      createdAt,
      creator,
      groups,
      _id,
    } = this.props;
    const { name, key, reviewerIds } = this.state;
    const _renderOtherContent = () => {
      if (!isCreateTheme) {
        return (
          <>
            <Row>
              <Label>{'模板组个数'}：</Label>
              <Text>{groups?.length || 0}</Text>
            </Row>
            {lastModified && (
              <Row>
                <Label>{'最新修改时间'}：</Label>
                <Text>
                  {Moment(lastModified).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </Row>
            )}
            {createdAt && (
              <Row>
                <Label>{'创建时间'}：</Label>
                <Text>{Moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
              </Row>
            )}
            {creator && (
              <Row>
                <Label>{'创建者'}：</Label>
                <Text>{creator}</Text>
              </Row>
            )}
          </>
        );
      }
      return null;
    };
    return (
      <ShowConfirm
        title={title}
        onCancel={onCancel}
        onConfirm={() =>
          onConfirm({ name, key, reviewerIds, isCreateTheme, _id })
        }
      >
        <Row>
          <Label>{'模板名'}：</Label>
          <HEInput
            value={name}
            onChange={this._handleNameChange}
            className="create-themeType-modal__content__row__input"
            type="text"
            maximumLetters={20}
            placeholder={'请输入新增的模板名'}
          />
        </Row>
        <Row>
          <Label>{'key'}：</Label>
          {isCreateTheme ? (
            <HEInput
              value={key}
              onChange={this._handleKeyChange}
              className="create-themeType-modal__content__row__input"
              type="text"
              maximumLetters={20}
              placeholder={'请输入新增的模板key, 必须唯一，无法修改'}
            />
          ) : (
            <Label>{key}</Label>
          )}
        </Row>
        <Row>
          <Label>{'审核者'}：</Label>
          <Select
            mode="tags"
            defaultValue={reviewerIds}
            value={this.state.reviewerIds}
            className="create-themeType-modal__content__row__input"
            placeholder="请输入审核者的员工号"
            onChange={this._handlereviewerIdsChange}
          >
            {reviewerIds &&
              reviewerIds.map((item) => <Option key={item}>{item}</Option>)}
          </Select>
        </Row>

        {_renderOtherContent()}
      </ShowConfirm>
    );
  }
}

export default CreateThemeTypeModal;
