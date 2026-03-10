import React from 'react';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HESkyLayer from 'components/HESkyLayer';
import { TreeSelect } from 'antd';
import { toastError } from 'components/HEToast';
import { connectToast } from 'context/feedback';
import './index.less';

function Row(props) {
  return (
    <div className="remove-theme-modal__content__row">{props.children}</div>
  );
}

function Label(props) {
  return (
    <label className="remove-theme-modal__content__row__label">
      {props.children}
    </label>
  );
}

class RemoveThemeModal extends React.Component {
  state = {
    selectedThemeType: this.props.themeType || null,
    selectedThemeGroup: this.props.themeGroupId || null,
  };
  handleThemeGroupChange = (value) => {
    const selected = value.split('-');
    this.setState({
      selectedThemeType: selected[0],
      selectedThemeGroup: selected[1],
    });
  };
  handleSubmit = () => {
    const { selectedThemeType, selectedThemeGroup } = this.state;
    if (
      selectedThemeType &&
      selectedThemeGroup &&
      (selectedThemeType != this.props.themeType ||
        selectedThemeGroup != this.props.themeGroupId)
    ) {
      this.props.onSubmit({ selectedThemeType, selectedThemeGroup });
    } else {
      toastError('请选择模板组！');
    }
  };
  render() {
    const { onClose, drawerData } = this.props;
    const { selectedThemeType, selectedThemeGroup } = this.state;
    const treeData = drawerData.map((item) => {
      const { groups, key, name } = item;
      const children = groups.map((group) => {
        const groupKey = key + '-' + group._id;
        return {
          title: group.name,
          value: groupKey,
          key: groupKey,
        };
      });
      let data = {
        title: name,
        value: key,
        key,
        children,
        selectable: false,
      };
      return data;
    });
    return (
      <HESkyLayer onOverlayClick={onClose} className="remove-theme-skylayer">
        <HEModal className="remove-theme-modal">
          <HEModalHeader title={'移动模板'} onClose={onClose} />
          <HEModalContent className="remove-theme-modal__content">
            <Row>
              <Label>{'模板类型'}：</Label>
              <TreeSelect
                className="remove-theme-modal__content__row__input"
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={treeData}
                value={
                  selectedThemeType && selectedThemeGroup
                    ? selectedThemeType + '-' + selectedThemeGroup
                    : ''
                }
                placeholder="请选择模板类型"
                treeDefaultExpandAll
                onChange={this.handleThemeGroupChange}
              />
            </Row>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this.handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default connectToast(RemoveThemeModal);
