import React from 'react';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HESkyLayer from 'components/HESkyLayer';
import HERadio from 'components/HERadio';
import { Select, Tag } from 'antd';
import './index.less';
import { getTagList } from 'apis/TagAPI';
import { toastError, toastSuccess } from 'components/HEToast';
import { widgetUpdate } from 'apis/WidgetAPI';

const { Option } = Select;

function Row(props) {
  return (
    <div className="widget-info-modal__content__row">{props.children}</div>
  );
}

function Label(props) {
  return (
    <label className="widget-info-modal_content__row__label">
      {props.children}
    </label>
  );
}

function tagRender(props) {
  const { label, value, closable, onClose } = props;

  return (
    <Tag
      color={value}
      closable={closable}
      onClose={onClose}
      style={{ marginRight: 3 }}
    >
      {label}
    </Tag>
  );
}

const DEFAULT_TYPE = [
  { key: '通用组件', value: 'common' },
  { key: '业务组件', value: 'custom' },
];

class WidgetInfoModal extends React.Component {
  state = {
    tagList: [],
    selectedTag: [],
    tagType: 'common',
  };

  async UNSAFE_componentWillMount() {
    const { widget } = this.props;
    let tagType = widget.tagType || 'common';
    const { list } = await getTagList(widget.category, tagType);
    this.setState({
      tagList: [...list],
      tagType: widget.tagType || 'common',
      selectedTag: widget.tag || ['其他'],
    });
  }

  _handleLayoutTypeSelect = async (event, selectValue) => {
    const { widget } = this.props;
    this.setState({ tagType: selectValue });
    const { list } = await getTagList(widget.category, selectValue);
    this.setState({
      tagList: [...list],
      selectedTag: [],
    });
  };

  handleChange(value) {
    this.setState({
      selectedTag: value,
    });
  }

  async _handleSubmit() {
    const { widget, onClose, fetchWidget } = this.props;
    const { tagType, selectedTag } = this.state;
    try {
      await widgetUpdate({
        widgetId: widget._id,
        userDeptId: widget.userDeptId,
        tag: selectedTag,
        tagType: tagType,
      });
      toastSuccess('更新成功', 3000, `${widget.name}组件更新成功。`);
      fetchWidget();
      onClose();
    } catch (err) {
      toastError('操作失败');
      onClose();
      console.log('err', err);
    }
  }

  render() {
    const { onClose, widget } = this.props;
    const { tagType, tagList } = this.state;
    const defaultValue = widget.tag ? widget.tag : [];
    const developers = widget.developers.length
      ? widget.developers.join('，')
      : '暂无';
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="widget-info-modal">
          <HEModalHeader title={`${widget.name}组件信息`} onClose={onClose} />
          <HEModalContent className="widget-info-modal__content">
            {widget.category == 'widget' ? (
              <Row>
                <Label>{'组件类型'}：</Label>
                <HERadio
                  onChange={this._handleLayoutTypeSelect.bind(this)}
                  options={DEFAULT_TYPE}
                  value={tagType}
                  className="widget-info-modal__content__row__input"
                />
              </Row>
            ) : null}
            <Row>
              <Label>{'组件标签'}：</Label>
              <Select
                mode="multiple"
                allowClear
                tagRender={tagRender}
                style={{ width: '80%' }}
                dropdownStyle={{ textAlign: 'left' }}
                placeholder="请选择当前组件标签"
                defaultValue={defaultValue}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                onChange={this.handleChange.bind(this)}
              >
                {tagList &&
                  tagList.map((item) => (
                    <Option key={item.name}>{item.name}</Option>
                  ))}
              </Select>
            </Row>
            <Row>
              <Label>{'开发者'}：</Label>
              <Label>{developers}</Label>
            </Row>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit.bind(this)}>
              {'确定'}
            </HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default WidgetInfoModal;
